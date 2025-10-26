import { useEffect, useState } from 'react';
import { postsApi } from '../api/posts';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import './Feed.css';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (pageNum: number) => {
    try {
      const response = await postsApi.getFeed(pageNum, 10);
      if (pageNum === 1) {
        setPosts(response.posts);
      } else {
        setPosts((prev) => [...prev, ...response.posts]);
      }
      setHasMore(response.posts.length === 10);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load posts');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="feed">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <h2>Welcome to Instagram Clone!</h2>
            <p>Start following people to see their posts in your feed.</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={() => loadPosts(1)} />
            ))}
            {hasMore && (
              <button onClick={handleLoadMore} className="btn btn-secondary load-more-btn">
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
