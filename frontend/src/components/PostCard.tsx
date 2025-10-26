import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { postsApi } from '../api/posts';
import { formatDate } from '../utils/formatDate';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postsApi.unlikePost(post.id);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await postsApi.likePost(post.id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await postsApi.createComment(post.id, commentText);
      setCommentText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user.username}`} className="post-user">
          <div className="post-avatar">
            {post.user.avatar ? (
              <img src={post.user.avatar} alt={post.user.username} />
            ) : (
              <div className="avatar-placeholder">
                {post.user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <span className="post-username">{post.user.username}</span>
        </Link>
      </div>

      <div className="post-image">
        <img src={post.imageUrl} alt={post.caption || 'Post'} />
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className="action-btn">
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="action-btn">
          💬
        </button>
      </div>

      <div className="post-info">
        <div className="post-likes">{likeCount} likes</div>

        {post.caption && (
          <div className="post-caption">
            <Link to={`/profile/${post.user.username}`} className="caption-username">
              {post.user.username}
            </Link>{' '}
            <span>{post.caption}</span>
          </div>
        )}

        {post._count.comments > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="view-comments-btn"
          >
            View all {post._count.comments} comments
          </button>
        )}

        <div className="post-timestamp">{formatDate(post.createdAt)}</div>
      </div>

      {showComments && post.comments && (
        <div className="post-comments">
          {post.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <Link to={`/profile/${comment.user.username}`} className="comment-username">
                {comment.user.username}
              </Link>{' '}
              <span>{comment.text}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleComment} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="comment-input"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="comment-submit"
        >
          Post
        </button>
      </form>
    </div>
  );
}
