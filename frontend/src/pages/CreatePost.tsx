import { useState, FormEvent, useRef, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import './CreatePost.css';

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageChange(file);
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
      if (caption) formData.append('caption', caption);
      if (location) formData.append('location', location);

      await postsApi.createPost(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container">
      <div className="create-post-wrapper">
        <div className="create-post-header">
          <h2>Create new post</h2>
          {preview && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary btn-sm"
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          )}
        </div>

        {!preview ? (
          <div
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="file-input-hidden"
            />
            <div className="upload-icon">
              <svg
                width="96"
                height="77"
                viewBox="0 0 96 77"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M48 0L45.1718 2.82843L37 11L42 16L46 12V35H50V12L54 16L59 11L50.8282 2.82843L48 0Z"
                  fill="currentColor"
                />
                <path
                  d="M0 27C0 24.7909 1.79086 23 4 23H30V27H4V73H92V27H66V23H92C94.2091 23 96 24.7909 96 27V73C96 75.2091 94.2091 77 92 77H4C1.79086 77 0 75.2091 0 73V27Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h3 className="upload-title">Drag photos here</h3>
            <button className="btn btn-primary" type="button">
              Select from computer
            </button>
          </div>
        ) : (
          <div className="preview-section">
            <div className="image-preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
              <button
                type="button"
                onClick={clearImage}
                className="change-photo-btn"
              >
                Change photo
              </button>
            </div>

            <div className="post-details">
              <form onSubmit={handleSubmit} className="post-form">
                <div className="form-section">
                  <label className="form-label">Caption</label>
                  <textarea
                    className="caption-textarea"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={2200}
                  />
                  <div className="character-count">
                    {caption.length}/2,200
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
