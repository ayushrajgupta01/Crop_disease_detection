import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  
  // Modal visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Form inputs
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  
  // Post inputs
  const [newCrop, setNewCrop] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Comments state
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('crop_user_token');
    const savedUser = localStorage.getItem('crop_user');
    if (savedToken && savedUser) {
      setIsLoggedIn(true);
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    fetchPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crop_user_token');
    localStorage.removeItem('crop_user');
    setIsLoggedIn(false);
    setUser(null);
    setToken('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = authMode === 'login' ? 'login' : 'signup';
    const body = authMode === 'login' 
      ? { emailOrUsername, password }
      : { username, email, password, location };

    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      
      // Save session
      localStorage.setItem('crop_user_token', data.token);
      localStorage.setItem('crop_user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      
      // Close modal & reset fields
      setShowAuthModal(false);
      setEmailOrUsername('');
      setUsername('');
      setEmail('');
      setPassword('');
      setLocation('');
      
      // Refetch posts to update any user specific views
      fetchPosts();
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newContent) {
      setError('Post content is required.');
      return;
    }

    const formData = new FormData();
    formData.append('content', newContent);
    formData.append('crop', newCrop || 'General');
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create post.');
        return;
      }

      // Prepend the new post and close modal
      setPosts([data, ...posts]);
      setShowCreatePostModal(false);
      setNewContent('');
      setNewCrop('');
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      setError('Server connection error.');
    }
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete post.');
        return;
      }

      // Remove from local state list
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      alert('Server error. Could not delete post.');
    }
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
      const res = await fetch(`${API_BASE}/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      if (res.ok) {
        setPosts(posts.map(p => p._id === postId ? data : p));
        setCommentInputs(prev => ({
          ...prev,
          [postId]: ''
        }));
      } else {
        alert(data.error || 'Failed to add comment');
      }
    } catch (err) {
      alert('Server error adding comment.');
    }
  };

  const openCreatePost = () => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      setShowCreatePostModal(true);
    }
  };

  const closeCreatePostModal = () => {
    setShowCreatePostModal(false);
    setNewContent('');
    setNewCrop('');
    setSelectedFile(null);
    setImagePreview(null);
    setError('');
  };

  return (
    <div className="community-view">
      <header className="view-header flex justify-between items-center">
        <div>
          <h1>Farmers Hub</h1>
          <p>Share your experiences and get help from the community.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="user-badge">
              <span>👤 {user?.username} ({user?.location})</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="nav-item" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
              Sign In
            </button>
          )}
          <button className="nav-item active" style={{ height: 'fit-content' }} onClick={openCreatePost}>
            <span>+</span> Create Post
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading community posts...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {posts.map(post => {
            const hasLiked = isLoggedIn && post.likes?.includes(user?.id);
            const loggedInUserId = isLoggedIn && user && (user.id || user._id);
            const postUserId = post && (post.user?._id || post.user);
            const isAuthor = !!loggedInUserId && !!postUserId && (postUserId.toString() === loggedInUserId.toString());

            return (
              <div key={post._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      background: 'var(--primary-light)', 
                      borderRadius: '50%', 
                      display: 'grid', 
                      placeItems: 'center', 
                      fontWeight: 'bold', 
                      color: 'var(--primary)' 
                    }}>
                      {post.username ? post.username[0].toUpperCase() : 'F'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem' }}>{post.username}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {post.crop} • {post.location} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isAuthor && (
                    <button 
                      onClick={() => handleDeletePost(post._id)}
                      style={{ 
                        background: 'none', 
                        color: '#ef4444', 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fee2e2',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
                {post.image ? (
                  <img src={post.image} alt="Crop" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
                ) : null}
                <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>{post.content}</p>
                
                <div className="flex gap-4 border-t pt-4">
                  <button 
                    className={`like-btn ${hasLiked ? 'liked' : ''}`} 
                    onClick={() => handleLike(post._id)}
                  >
                    👍 {post.likes?.length || 0} Likes
                  </button>
                  <button 
                    onClick={() => toggleComments(post._id)}
                    style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', border: 'none', outline: 'none' }}
                  >
                    💬 {post.comments?.length || 0} Comments
                  </button>
                </div>

                {expandedComments[post._id] && (
                  <div className="comments-section" style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <h5 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Discussion</h5>
                    <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '4px' }}>
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment, index) => (
                          <div key={index} className="comment" style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <div style={{ 
                              width: 24, 
                              height: 24, 
                              background: 'var(--primary-light)', 
                              borderRadius: '50%', 
                              display: 'grid', 
                              placeItems: 'center', 
                              fontWeight: 'bold', 
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              flexShrink: 0
                            }}>
                              {comment.username ? comment.username[0].toUpperCase() : 'U'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 'bold', color: 'var(--text-main)', marginRight: '6px' }}>{comment.username}</span>
                              <p style={{ display: 'inline', color: 'var(--text-main)', margin: 0, wordBreak: 'break-word' }}>{comment.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No comments yet. Start the discussion!</p>
                      )}
                    </div>
                    {isLoggedIn ? (
                      <div className="add-comment" style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Write a comment..." 
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '0.85rem',
                            outline: 'none',
                            backgroundColor: '#f8fafc',
                            color: 'var(--text-main)'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post._id);
                            }
                          }}
                        />
                        <button 
                          onClick={() => handleAddComment(post._id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                        Please <span onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</span> to join the discussion.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Auth Modal (Sign In / Sign Up) */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'Sign In to CropGuard' : 'Create an Account'}</h3>
              <button className="close-btn" onClick={() => setShowAuthModal(false)}>&times;</button>
            </div>
            
            {error && <div className="alert-error">{error}</div>}
            
            <form onSubmit={handleAuthSubmit}>
              {authMode === 'login' ? (
                <>
                  <div className="form-group">
                    <label>Username or Email</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={emailOrUsername} 
                      onChange={e => setEmailOrUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Location / State</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Karnataka, Maharashtra" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                    />
                  </div>
                </>
              )}
              
              <button type="submit" className="submit-btn">
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            
            <div className="auth-toggle">
              {authMode === 'login' ? (
                <p>Don't have an account? <span onClick={() => { setAuthMode('signup'); setError(''); }}>Sign Up</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => { setAuthMode('login'); setError(''); }}>Sign In</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="modal-overlay" onClick={closeCreatePostModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a New Post</h3>
              <button className="close-btn" onClick={closeCreatePostModal}>&times;</button>
            </div>
            
            {error && <div className="alert-error">{error}</div>}
            
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label>Crop Category</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Rice, Tomato, Wheat" 
                  value={newCrop} 
                  onChange={e => setNewCrop(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>What's on your mind?</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Ask a question or share advice..."
                  value={newContent} 
                  onChange={e => setNewContent(e.target.value)} 
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Upload Image (Optional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ fontSize: '0.9rem' }}
                  />
                  {imagePreview && (
                    <div style={{ position: 'relative', marginTop: '8px' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <button type="submit" className="submit-btn">Post to Hub</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
