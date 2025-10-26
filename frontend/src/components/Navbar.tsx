import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Instagram Clone
        </Link>

        <div className="navbar-nav">
          <Link to="/" className="navbar-link" title="Home">
            ⌂
          </Link>
          <Link to="/create" className="navbar-link" title="Create Post">
            ＋
          </Link>
          <Link to={`/profile/${user?.username}`} className="navbar-link" title="Profile">
            ◎
          </Link>
          <button
            onClick={handleLogout}
            className="navbar-link"
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ⎋
          </button>
        </div>
      </div>
    </nav>
  );
}
