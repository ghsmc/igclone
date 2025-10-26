import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import './CreatePost.css';

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      if (caption) {
        formData.append('caption', caption);
      }

      await postsApi.createPost(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="create-post">
        <h2>Create New Post</h2>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label className="form-label">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              required
            />
          </div>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Caption</label>
            <textarea
              className="form-textarea"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
