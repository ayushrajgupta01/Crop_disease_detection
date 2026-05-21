import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { MessageSquare, Heart, Share2, Plus } from 'lucide-react-native';
import { Colors } from '../theme/colors';

const CommunityScreen = () => {
  const posts = [
    { 
      id: 1, 
      user: 'Ramesh K.', 
      location: 'Karnataka', 
      content: 'My tomato crops are finally recovering after using the recommended copper spray from AgroBot. Thanks everyone!',
      likes: 24,
      comments: 5,
      time: '2h ago'
    },
    { 
      id: 2, 
      user: 'Anita S.', 
      location: 'Maharashtra', 
      content: 'Anyone else seeing early signs of Rice Blast in the Pune region? The humidity has been very high lately.',
      likes: 12,
      comments: 18,
      time: '5h ago'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Farmer Community</Text>
          <Text style={styles.subtitle}>Connect with experts and fellow farmers.</Text>
        </View>

        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{post.user[0]}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{post.user}</Text>
                <Text style={styles.userLoc}>{post.location} • {post.time}</Text>
              </View>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Heart size={20} color={Colors.textMuted} />
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <MessageSquare size={20} color={Colors.textMuted} />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Share2 size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.fab}>
        <Plus color="white" size={30} />
      </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 5,
  },
  postCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
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
    fontSize: 12,
    color: Colors.textMuted,
  },
  postContent: {
    fontSize: 15,
    color: Colors.textMain,
    lineHeight: 22,
    marginBottom: 20,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
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
  }
});

export default CommunityScreen;
