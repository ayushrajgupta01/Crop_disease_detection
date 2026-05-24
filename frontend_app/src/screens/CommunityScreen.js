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
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  ArrowLeft,
  Trash2,
  Camera as CameraIcon,
  Image as ImageIcon,
  Send,
  ThumbsUp,
  MapPin,
  Search,
  Info,
  Calendar,
  UserCheck
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { screenStyles } from '../theme/screenStyles';
import ScreenHero from '../components/ScreenHero';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Users } from 'lucide-react-native';
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
  const { isLoggedIn, user, token, exitGuest } = useContext(AuthContext);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');

  // Local Post Creation Input Modal
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [crop, setCrop] = useState('General');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [postLoading, setPostLoading] = useState(false);

  // Truncation expansion state
  const [expandedPosts, setExpandedPosts] = useState({});

  // Comments state
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedPostForDetail, setSelectedPostForDetail] = useState(null);

  // Dynamic Avatar Colors
  const getAvatarBg = (username) => {
    const colors = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5'];
    let sum = 0;
    for (let i = 0; i < (username?.length || 0); i++) {
      sum += username.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  // Relative Time Formatter
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Some time ago';
    }
  };

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
        setCrop('General');
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
        if (selectedPostForDetail && selectedPostForDetail._id === postId) {
          setSelectedPostForDetail(response.data);
        }
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
                if (selectedPostForDetail && selectedPostForDetail._id === postId) {
                  setSelectedPostForDetail(null);
                }
                showAlert('Success', 'Post deleted successfully.');
              }
            } catch (error) {
              console.error('Delete post error details:', error);
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
          onPress: exitGuest,
        }
      ]
    );
  };

  const toggleExpandPost = (postId) => {
    setExpandedPosts(prev => ({
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
    setCrop('General');
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

  // Local Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesCrop = selectedCrop === 'All' || post.crop?.toLowerCase() === selectedCrop.toLowerCase();
    const matchesSearch = !searchQuery ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <ScreenHero
          badgeIcon={<Sparkles size={12} color="#6ee7b7" />}
          badgeText="FARMERS NETWORK"
          title="Community"
          subtitle="Discuss crops, share solutions, and learn from farmers near you."
          stats={[
            { value: `${posts.length}`, label: 'Posts' },
            { value: '7', label: 'Crops' },
            { value: 'Live', label: 'Feed' },
          ]}
          gradient="green"
        />

        <View style={styles.filtersSection}>
          <View style={screenStyles.searchBar}>
            <Search size={18} color={Colors.textMuted} />
            <TextInput
              style={screenStyles.searchInput}
              placeholder="Search crop, problem, or location…"
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.searchClearText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollView}
            nestedScrollEnabled
          >
            {['All', 'Wheat', 'Tomato', 'Rice', 'Maize', 'Cotton', 'General'].map((item) => {
              const isSelected = selectedCrop === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedCrop(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {item === 'All' ? '🌱 All' : item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.postsSection}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyView}>
            <Users size={40} color={Colors.primary} style={{ opacity: 0.4, marginBottom: 12 }} />
            <Text style={styles.emptyTextTitle}>No posts matching filters</Text>
            <Text style={styles.emptyTextDesc}>Be the first to share an update or start a discussion in this category!</Text>
            <TouchableOpacity style={styles.emptyCreateBtn} onPress={handleAddPostClick}>
              <Text style={styles.emptyCreateBtnText}>Create a Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPosts.map(post => {
            const hasLiked = isLoggedIn && user && post.likes?.includes(user.id);
            const loggedInUserId = isLoggedIn && user && (user.id || user._id);
            const postUserId = post && (post.user?._id || post.user);
            const isAuthor = !!loggedInUserId && !!postUserId && (postUserId.toString() === loggedInUserId.toString());
            const isExpert = post.username?.toLowerCase().includes('expert') || post.username?.toLowerCase().includes('admin');

            const isExpanded = !!expandedPosts[post._id];
            const showReadMore = post.content?.length > 160;
            const contentText = showReadMore && !isExpanded
              ? `${post.content.substring(0, 160)}...`
              : post.content;

            return (
              <View key={post._id} style={styles.postCard}>
                {/* Author Block */}
                <View style={styles.postHeader}>
                  <View style={[styles.userAvatar, { backgroundColor: getAvatarBg(post.username) }]}>
                    <Text style={styles.avatarText}>
                      {post.username ? post.username[0].toUpperCase() : 'F'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.userName}>{post.username}</Text>
                      {isExpert ? (
                        <View style={styles.expertBadge}>
                          <Text style={styles.expertBadgeText}>Expert</Text>
                        </View>
                      ) : (
                        <View style={styles.farmerBadge}>
                          <Text style={styles.farmerBadgeText}>Farmer</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.metaRow}>
                      <MapPin size={10} color={Colors.textMuted} style={{ marginRight: 2 }} />
                      <Text style={styles.metaText}>{post.location}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>{formatRelativeTime(post.createdAt)}</Text>
                    </View>
                  </View>

                  {/* Crop badge pill in card */}
                  <View style={styles.cardCropBadge}>
                    <Text style={styles.cardCropBadgeText}>{post.crop}</Text>
                  </View>
                </View>

                {/* Post Body Image */}
                {post.image ? (
                  <View style={styles.postImageContainer}>
                    <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
                  </View>
                ) : null}

                {/* Post Content */}
                <Text style={styles.postContent}>{contentText}</Text>

                {showReadMore && (
                  <TouchableOpacity onPress={() => toggleExpandPost(post._id)} style={{ marginBottom: 12 }}>
                    <Text style={styles.readMoreText}>{isExpanded ? 'Show Less' : 'Read More'}</Text>
                  </TouchableOpacity>
                )}

                {/* Post Action Buttons */}
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post._id)} activeOpacity={0.7}>
                    <Heart size={18} color={hasLiked ? '#ef4444' : Colors.textMuted} fill={hasLiked ? '#ef4444' : 'transparent'} />
                    <Text style={[styles.actionText, hasLiked && { color: '#ef4444', fontWeight: '800' }]}>
                      {post.likes?.length || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedPostForDetail(post)} activeOpacity={0.7}>
                    <MessageSquare size={18} color={Colors.textMuted} />
                    <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(post)} activeOpacity={0.7}>
                    <Share2 size={18} color={Colors.textMuted} />
                  </TouchableOpacity>

                  {isAuthor && (
                    <TouchableOpacity onPress={() => handleDeletePost(post._id)} style={styles.deleteBtn} activeOpacity={0.7}>
                      <Trash2 size={16} color="#f43f5e" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddPostClick} activeOpacity={0.85}>
        <Plus color="white" size={28} />
      </TouchableOpacity>

      {/* Create Post Sheet / Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={postModalVisible}
        onRequestClose={closePostModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share to Community</Text>
              <TouchableOpacity onPress={closePostModal} style={styles.modalCloseCircle}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Selector Crop Chips */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Related Crop Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {['General', 'Wheat', 'Tomato', 'Rice', 'Maize', 'Cotton'].map(item => {
                  const isSel = crop === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.createCropChip, isSel && styles.createCropChipActive]}
                      onPress={() => setCrop(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.createCropChipText, isSel && styles.createCropChipTextActive]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Content Text Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Discuss details</Text>
              <TextInput
                style={styles.modalInputTextarea}
                placeholder="What details, questions, or updates do you want to share with other farmers?"
                placeholderTextColor="#94a3b8"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
              />
            </View>

            {/* Image Picker Buttons */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Attach Photo</Text>

              {!imageUri ? (
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={() => pickImage(true)}
                    activeOpacity={0.7}
                  >
                    <CameraIcon size={18} color={Colors.primary} />
                    <Text style={styles.pickerBtnText}>Capture Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={() => pickImage(false)}
                    activeOpacity={0.7}
                  >
                    <ImageIcon size={18} color={Colors.primary} />
                    <Text style={styles.pickerBtnText}>From Gallery</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.modalPreviewImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUri(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {postLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 15 }} />
            ) : (
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePost} activeOpacity={0.8}>
                <Text style={styles.submitBtnText}>Publish Update</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Detail Post Comments Modal */}
      {selectedPostForDetail && (
        <Modal
          animationType="slide"
          visible={selectedPostForDetail !== null}
          onRequestClose={() => setSelectedPostForDetail(null)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['bottom', 'top']}>
            <View style={styles.detailContainer}>
              {/* Floating Back Header */}
              <View style={styles.detailHeader}>
                <TouchableOpacity
                  style={styles.detailHeaderBtn}
                  onPress={() => setSelectedPostForDetail(null)}
                  activeOpacity={0.7}
                >
                  <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.detailHeaderTitle}>Discussion Thread</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
                {selectedPostForDetail.image ? (
                  <Image
                    source={{ uri: selectedPostForDetail.image }}
                    style={styles.detailImage}
                    resizeMode="cover"
                  />
                ) : null}

                {/* Post Details Content */}
                <View style={styles.detailContentContainer}>
                  {/* User Profile Info */}
                  <View style={styles.detailUserRow}>
                    <View style={[styles.detailUserAvatar, { backgroundColor: getAvatarBg(selectedPostForDetail.username) }]}>
                      <Text style={styles.detailAvatarText}>
                        {selectedPostForDetail.username ? selectedPostForDetail.username[0].toUpperCase() : 'U'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailUserName}>
                        {selectedPostForDetail.username}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={10} color={Colors.textMuted} />
                        <Text style={styles.detailUserSub}>{selectedPostForDetail.location}</Text>
                        <Text style={styles.detailUserSub}>•</Text>
                        <Text style={styles.detailUserSub}>{formatRelativeTime(selectedPostForDetail.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.detailCropBadge}>
                      <Text style={styles.detailCropBadgeText}>{selectedPostForDetail.crop}</Text>
                    </View>
                  </View>

                  {/* Body Text */}
                  <Text style={styles.detailContentText}>
                    {selectedPostForDetail.content}
                  </Text>

                  {/* Likes/Dislikes Action Bar */}
                  <View style={styles.detailPostActions}>
                    <TouchableOpacity
                      style={styles.detailActionItem}
                      onPress={() => handleLike(selectedPostForDetail._id)}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={16}
                        color={selectedPostForDetail.likes?.includes(user?.id) ? '#ef4444' : Colors.textMuted}
                        fill={selectedPostForDetail.likes?.includes(user?.id) ? '#ef4444' : 'transparent'}
                      />
                      <Text style={{ fontSize: 13, color: Colors.textMain, fontWeight: '700' }}>
                        {selectedPostForDetail.likes?.length || 0} Likes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.detailActionItem}
                      onPress={() => handleShare(selectedPostForDetail)}
                      activeOpacity={0.7}
                    >
                      <Share2 size={16} color={Colors.textMuted} />
                      <Text style={{ fontSize: 13, color: Colors.textMuted }}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Discussions / Comments section */}
                  <View style={styles.commentsLabelRow}>
                    <MessageSquare size={16} color={Colors.textMain} />
                    <Text style={styles.commentsLabel}>
                      Comments ({selectedPostForDetail.comments?.length || 0})
                    </Text>
                  </View>

                  <View style={styles.detailCommentsList}>
                    {selectedPostForDetail.comments && selectedPostForDetail.comments.length > 0 ? (
                      selectedPostForDetail.comments.map((comment, index) => (
                        <View key={index} style={styles.commentItem}>
                          <View style={[styles.commentAvatar, { backgroundColor: getAvatarBg(comment.username) }]}>
                            <Text style={styles.commentAvatarText}>
                              {comment.username ? comment.username[0].toUpperCase() : 'U'}
                            </Text>
                          </View>
                          <View style={styles.commentBubble}>
                            <View style={styles.commentHeader}>
                              <Text style={styles.commentUser}>{comment.username}</Text>
                              <Text style={styles.commentTime}>
                                {comment.createdAt ? formatRelativeTime(comment.createdAt) : ''}
                              </Text>
                            </View>
                            <Text style={styles.commentText}>{comment.text}</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noCommentsBlock}>
                        <Text style={styles.noCommentsText}>No answers yet. Share your experience!</Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>

              {/* Chat-style bottom comment box */}
              {isLoggedIn ? (
                <View style={styles.detailFooter}>
                  <View style={styles.detailInputContainer}>
                    <TextInput
                      style={styles.detailTextInput}
                      placeholder="Add helpful comment or advice..."
                      placeholderTextColor="#a0aec0"
                      value={commentInputs[selectedPostForDetail._id] || ''}
                      onChangeText={(val) => setCommentInputs({ ...commentInputs, [selectedPostForDetail._id]: val })}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.detailSendBtn,
                        (commentInputs[selectedPostForDetail._id] && commentInputs[selectedPostForDetail._id].trim()) ? styles.detailSendBtnActive : {}
                      ]}
                      onPress={() => handleAddComment(selectedPostForDetail._id)}
                      disabled={!(commentInputs[selectedPostForDetail._id] && commentInputs[selectedPostForDetail._id].trim())}
                      activeOpacity={0.7}
                    >
                      <Send
                        size={16}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.detailFooterAuthMuted}>
                  <TouchableOpacity onPress={() => { setSelectedPostForDetail(null); promptAuthRedirect(); }}>
                    <Text style={styles.detailFooterAuthMutedText}>
                      Please <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Sign In</Text> to write a comment
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  postsSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  searchClearText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  filterScrollView: {
    paddingBottom: 8,
    paddingTop: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: 'white',
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  farmerBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  farmerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  expertBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expertBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  metaDot: {
    fontSize: 10,
    color: Colors.textMuted,
    marginHorizontal: 4,
  },
  cardCropBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'center',
  },
  cardCropBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  postContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 12,
  },
  postImageContainer: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  actionText: {
    marginLeft: 6,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyView: {
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTextTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptyTextDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyCreateBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  emptyCreateBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  // Modal Overlays
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createCropChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  createCropChipActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  createCropChipText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  createCropChipTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  modalInputTextarea: {
    minHeight: 100,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    padding: 12,
    color: Colors.textMain,
    fontSize: 13,
    backgroundColor: '#f8fafc',
    textAlignVertical: 'top',
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  pickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalPreviewImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.9)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  submitBtn: {
    backgroundColor: '#10b981',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  // Detail Modal Screen Styles
  detailContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#022c22',
  },
  detailHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  detailHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#e2e8f0',
  },
  detailContentContainer: {
    padding: 16,
  },
  detailUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailAvatarText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
  detailUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailUserSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  detailCropBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailCropBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  detailContentText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 12,
  },
  detailPostActions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 12,
    marginBottom: 18,
  },
  detailActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailCommentsList: {
    gap: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  commentAvatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentUser: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  commentTime: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  commentText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  noCommentsBlock: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  detailFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: 'white',
  },
  detailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 4,
  },
  detailTextInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMain,
    paddingVertical: 6,
    maxHeight: 80,
  },
  detailSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  detailSendBtnActive: {
    backgroundColor: '#10b981',
  },
  detailFooterAuthMuted: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  detailFooterAuthMutedText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

export default CommunityScreen;
