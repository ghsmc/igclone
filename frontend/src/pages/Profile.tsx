import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usersApi } from '../api/users';
import { postsApi } from '../api/posts';
import { User, Post } from '../types';
import { useAuthStore } from '../store/authStore';
import './Profile.css';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = useAuthStore((state) => state.user);
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const [userResponse, postsResponse] = await Promise.all([
          usersApi.getUserProfile(username),
          postsApi.getUserPosts(username),
        ]);
        setUser(userResponse.user);
        setPosts(postsResponse.posts);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!user) return;

    try {
      if (user.isFollowing) {
        await usersApi.unfollowUser(user.id);
        setUser({ ...user, isFollowing: false });
      } else {
        await usersApi.followUser(user.id);
        setUser({ ...user, isFollowing: true });
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container">
        <div className="error-message">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder-large">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-top">
              <h2 className="profile-username">{user.username}</h2>
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`btn ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{user._count?.posts || 0}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user._count?.followers || 0}</span>
                <span className="stat-label">followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user._count?.following || 0}</span>
                <span className="stat-label">following</span>
              </div>
            </div>

            <div className="profile-details">
              {user.fullName && <div className="profile-fullname">{user.fullName}</div>}
              {user.bio && <div className="profile-bio">{user.bio}</div>}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-website"
                >
                  {user.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="profile-posts">
          <h3 className="posts-title">Posts</h3>
          <div className="posts-grid">
            {posts.length === 0 ? (
              <div className="no-posts">No posts yet</div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="grid-post">
                  <img src={post.imageUrl} alt={post.caption || 'Post'} />
                  <div className="grid-post-overlay">
                    <span>❤️ {post._count.likes}</span>
                    <span>💬 {post._count.comments}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
