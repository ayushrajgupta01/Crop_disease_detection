import React from 'react';

const Community = () => {
  const posts = [
    { id: 1, user: "Farmer Ramesh", crop: "Rice", time: "2h ago", text: "Seeing some yellow spots on my rice leaves. Any advice?", image: "https://images.unsplash.com/photo-1536630596251-b01c62536286?auto=format&fit=crop&q=80&w=400", likes: 12, comments: 4 },
    { id: 2, user: "Suresh P.", crop: "Tomato", time: "5h ago", text: "Successfully treated Early Blight using copper fungicide recommended here!", image: "https://images.unsplash.com/photo-1592840331052-16e15c2c6f95?auto=format&fit=crop&q=80&w=400", likes: 45, comments: 8 },
  ];

  return (
    <div className="community-view">
      <header className="view-header flex justify-between items-center">
        <div>
          <h1>Farmers Hub</h1>
          <p>Share your experiences and get help from the community.</p>
        </div>
        <button className="nav-item active" style={{ height: 'fit-content' }}>
          <span>+</span> Create Post
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {posts.map(post => (
          <div key={post.id} className="card">
            <div className="flex items-center gap-4 mb-4">
              <div style={{ width: 40, height: 40, background: 'var(--primary-light)', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                {post.user[0]}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem' }}>{post.user}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{post.crop} • {post.time}</p>
              </div>
            </div>
            <p style={{ marginBottom: '1rem' }}>{post.text}</p>
            <img src={post.image} alt="Crop" style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }} />
            <div className="flex gap-4 border-t pt-4">
              <button style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>👍 {post.likes} Likes</button>
              <button style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>💬 {post.comments} Comments</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
