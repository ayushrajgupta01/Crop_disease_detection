import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  Share
} from 'react-native';
import { MessageSquare, Heart, Share2, Plus, ArrowLeft, Trash2, Camera as CameraIcon, Image as ImageIcon, Send, ThumbsUp } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      const hasCancel = buttons.some(btn => btn.style === 'cancel' || btn.text.toLowerCase() === 'cancel');
      const actionButton = buttons.find(btn => btn.style !== 'cancel' && btn.text.toLowerCase() !== 'cancel');
      
      if (hasCancel && actionButton) {
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed && actionButton.onPress) {
          actionButton.onPress();
        } else {
          const cancelBtn = buttons.find(btn => btn.style === 'cancel' || btn.text.toLowerCase() === 'cancel');
          if (cancelBtn && cancelBtn.onPress) {
            cancelBtn.onPress();
          }
        }
      } else {
        window.alert(`${title}\n\n${message}`);
        if (buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

const CommunityScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Consume Global Auth Context
  const { isLoggedIn, user, token, logout } = useContext(AuthContext);

  // Local Post Creation Input Modal
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [crop, setCrop] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [postLoading, setPostLoading] = useState(false);

  // Comments state
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);

  // Fetch posts from backend database
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts`);
      if (response.data) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      showAlert('Error', 'Could not load posts from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showAlert("Permission Denied", "Camera permission is required to capture photos.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert("Permission Denied", "Gallery access is required to choose photos.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      showAlert("Error", "Failed to select image.");
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      showAlert('Validation Error', 'Post content is required.');
      return;
    }

    setPostLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('crop', crop || 'General');

      if (imageUri) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
          uri: imageUri,
          name: filename || 'photo.jpg',
          type: type
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        setPosts(prev => [response.data, ...prev]);
        setPostModalVisible(false);
        setCrop('');
        setContent('');
        setImageUri(null);
        showAlert('Success', 'Post shared to community.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create post.';
      showAlert('Post Error', errorMsg);
    } finally {
      setPostLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) {
      promptAuthRedirect();
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        setPosts(prev => prev.map(post => post._id === postId ? response.data : post));
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleShare = async (post) => {
    try {
      const message = `Check out this post on CropGuard Community:\n\n"${post.content}"\n\nPosted by: ${post.username}\nLocation: ${post.location}\nCrop: ${post.crop}`;
      await Share.share({
        message,
        title: `CropGuard Post by ${post.username}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    showAlert(
      'Confirm Delete',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (response.data) {
                setPosts(prev => prev.filter(post => post._id !== postId));
                showAlert('Success', 'Post deleted successfully.');
              }
            } catch (error) {
              console.error('Delete post error details:', error);
              if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
              }
              const errorMsg = error.response?.data?.error || 'Failed to delete post.';
              showAlert('Error', errorMsg);
            }
          } 
        }
      ]
    );
  };

  const promptAuthRedirect = () => {
    showAlert(
      'Authentication Required',
      'Please sign in or register to publish community posts and like other updates.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Login / Sign Up', 
          onPress: () => {
            // Trigger logout to redirect user back to the landing screen
            logout();
          } 
        }
      ]
    );
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        setPosts(prev => prev.map(post => post._id === postId ? response.data : post));
        setSelectedPostForDetail(response.data);
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send comment.';
      showAlert('Error', errorMsg);
    }
  };

  const closePostModal = () => {
    setPostModalVisible(false);
    setCrop('');
    setContent('');
    setImageUri(null);
  };

  const handleAddPostClick = () => {
    if (!isLoggedIn) {
      promptAuthRedirect();
    } else {
      setPostModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Farmer Community</Text>
          <Text style={styles.subtitle}>Connect with experts and fellow farmers.</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No posts available. Be the first to share!</Text>
          </View>
        ) : (
          posts.map(post => {
            const hasLiked = isLoggedIn && user && post.likes?.includes(user.id);
            const loggedInUserId = isLoggedIn && user && (user.id || user._id);
            const postUserId = post && (post.user?._id || post.user);
            const isAuthor = !!loggedInUserId && !!postUserId && (postUserId.toString() === loggedInUserId.toString());

            return (
              <View key={post._id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>
                      {post.username ? post.username[0].toUpperCase() : 'F'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{post.username}</Text>
                    <Text style={styles.userLoc}>
                      {post.crop !== 'General' ? `${post.crop} • ` : ''}
                      {post.location} • {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {isAuthor && (
                    <TouchableOpacity onPress={() => handleDeletePost(post._id)} style={{ padding: 5 }}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                {post.image ? (
                  <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
                ) : null}
                <Text style={styles.postContent}>{post.content}</Text>
                
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post._id)}>
                    <Heart size={20} color={hasLiked ? '#ef4444' : Colors.textMuted} fill={hasLiked ? '#ef4444' : 'transparent'} />
                    <Text style={[styles.actionText, hasLiked && { color: '#ef4444', fontWeight: 'bold' }]}>
                      {post.likes?.length || 0}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedPostForDetail(post)}>
                    <MessageSquare size={20} color={Colors.textMuted} />
                    <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(post)}>
                    <Share2 size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      
      <TouchableOpacity style={styles.fab} onPress={handleAddPostClick}>
        <Plus color="white" size={30} />
      </TouchableOpacity>

      {/* Create Post Sheet / Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={postModalVisible}
        onRequestClose={closePostModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a New Post</Text>
              <TouchableOpacity onPress={closePostModal}>
                <Text style={styles.closeModalBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Crop Type (e.g. Wheat, Tomato)"
              placeholderTextColor="#a0aec0"
              value={crop}
              onChangeText={setCrop}
            />
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="What agricultural advice do you need or want to share?"
              placeholderTextColor="#a0aec0"
              value={content}
              onChangeText={setContent}
              multiline
            />

            {/* Image Picker Buttons */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.textMain, marginBottom: 8 }}>
                Add Photo (Optional)
              </Text>
              
              {!imageUri ? (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity 
                    style={styles.pickerBtn} 
                    onPress={() => pickImage(true)}
                  >
                    <CameraIcon size={16} color={Colors.primary} />
                    <Text style={styles.pickerBtnText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.pickerBtn} 
                    onPress={() => pickImage(false)}
                  >
                    <ImageIcon size={16} color={Colors.primary} />
                    <Text style={styles.pickerBtnText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.modalPreviewImage} resizeMode="cover" />
                  <TouchableOpacity 
                    style={styles.removeImageBtn} 
                    onPress={() => setImageUri(null)}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {postLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 15 }} />
            ) : (
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePost}>
                <Text style={styles.submitBtnText}>Share Post</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Detail Post Modal */}
      {selectedPostForDetail && (
        <Modal
          animationType="slide"
          visible={selectedPostForDetail !== null}
          onRequestClose={() => setSelectedPostForDetail(null)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['bottom']}>
            <View style={styles.detailContainer}>
              {/* Absolute Header Overlay */}
              <View style={styles.detailHeader}>
                <TouchableOpacity 
                  style={styles.detailHeaderBtn} 
                  onPress={() => setSelectedPostForDetail(null)}
                >
                  <ArrowLeft size={22} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                {selectedPostForDetail.image ? (
                  <Image 
                    source={{ uri: selectedPostForDetail.image }} 
                    style={styles.detailImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.detailImage, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                    <ImageIcon size={48} color="#cbd5e1" />
                  </View>
                )}

                {/* Post Details Content */}
                <View style={styles.detailContentContainer}>
                  {/* User Block */}
                  <View style={styles.detailUserRow}>
                    <View style={styles.detailUserAvatar}>
                      <Text style={styles.detailAvatarText}>
                        {selectedPostForDetail.username ? selectedPostForDetail.username[0].toUpperCase() : 'U'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.detailUserName}>
                        {selectedPostForDetail.username}
                        <Text style={{ fontWeight: 'normal', color: Colors.textMuted }}> • {selectedPostForDetail.location}</Text>
                      </Text>
                      <Text style={styles.detailUserSub}>
                        {new Date(selectedPostForDetail.createdAt).toLocaleDateString()} • {selectedPostForDetail.crop}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={styles.detailTitle}>
                    Help identifying problem with my {selectedPostForDetail.crop}
                  </Text>

                  {/* Content */}
                  <Text style={styles.detailContentText}>
                    {selectedPostForDetail.content}
                  </Text>

                  {/* Translate Mockup */}
                  <TouchableOpacity style={{ marginVertical: 10 }}>
                    <Text style={{ color: Colors.textMuted, fontSize: 13 }}>Translate</Text>
                  </TouchableOpacity>

                  {/* Post Actions (Likes/Dislikes/Share) */}
                  <View style={styles.detailPostActions}>
                    <TouchableOpacity 
                      style={styles.detailActionItem} 
                      onPress={() => handleLike(selectedPostForDetail._id)}
                    >
                      <ThumbsUp size={18} color={selectedPostForDetail.likes?.includes(user?.id) ? Colors.primary : Colors.textMuted} />
                      <Text style={{ fontSize: 13, color: Colors.textMuted }}>
                        {selectedPostForDetail.likes?.length || 0}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.detailActionItem}
                      onPress={() => handleShare(selectedPostForDetail)}
                    >
                      <Share2 size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Comments List */}
                  <View style={styles.detailCommentsList}>
                    {selectedPostForDetail.comments && selectedPostForDetail.comments.length > 0 ? (
                      selectedPostForDetail.comments.map((comment, index) => (
                        <View key={index} style={styles.commentItem}>
                          <View style={styles.commentAvatar}>
                            <Text style={styles.commentAvatarText}>
                              {comment.username ? comment.username[0].toUpperCase() : 'U'}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.commentUser}>{comment.username}</Text>
                            <Text style={styles.commentText}>{comment.text}</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noCommentsText}>No comments yet</Text>
                    )}
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Footer Discussion Area */}
              <View style={styles.detailFooter}>
                <View style={styles.detailInputContainer}>
                  <CameraIcon size={20} color={Colors.textMuted} />
                  <TextInput
                    style={styles.detailTextInput}
                    placeholder="Write your answer"
                    placeholderTextColor="#a0aec0"
                    value={commentInputs[selectedPostForDetail._id] || ''}
                    onChangeText={(val) => setCommentInputs({ ...commentInputs, [selectedPostForDetail._id]: val })}
                  />
                </View>
                <TouchableOpacity 
                  style={[
                    styles.detailSendBtn, 
                    (commentInputs[selectedPostForDetail._id] && commentInputs[selectedPostForDetail._id].trim()) ? { backgroundColor: Colors.primary } : {}
                  ]}
                  onPress={() => handleAddComment(selectedPostForDetail._id)}
                >
                  <Send 
                    size={18} 
                    color={(commentInputs[selectedPostForDetail._id] && commentInputs[selectedPostForDetail._id].trim()) ? 'white' : Colors.textMuted} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
  },
  postCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  userLoc: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  postContent: {
    fontSize: 15,
    color: Colors.textMain,
    lineHeight: 22,
    marginBottom: 15,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  actionText: {
    marginLeft: 6,
    color: Colors.textMuted,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyView: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  closeModalBtn: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  modalInput: {
    height: 48,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: Colors.textMain,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalPreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  commentsSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  commentsSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 10,
  },
  commentsList: {
    marginBottom: 15,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: Colors.textMain,
    lineHeight: 18,
  },
  noCommentsText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 5,
  },
  addCommentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#f8fafc',
    color: Colors.textMain,
  },
  commentSendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSendText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loginToCommentText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: 5,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  detailHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  detailHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailImage: {
    width: '100%',
    height: 280,
  },
  detailContentContainer: {
    padding: 20,
  },
  detailUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailAvatarText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 18,
  },
  detailUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  detailUserSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 10,
    lineHeight: 26,
  },
  detailContentText: {
    fontSize: 15,
    color: Colors.textMain,
    lineHeight: 22,
    marginBottom: 10,
  },
  detailPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 12,
    marginVertical: 15,
  },
  detailActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailCommentsList: {
    marginTop: 5,
  },
  detailFooter: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailInputContainer: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  detailTextInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: Colors.textMain,
  },
  detailSendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CommunityScreen;
