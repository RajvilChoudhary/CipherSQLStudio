// frontend/src/components/common/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <div className="brand-icon">CSS</div>
        <span className="brand-name">
          Cipher<span>SQL</span>Studio
        </span>
      </Link>

      <div className="navbar__nav">
        <Link to="/assignments">Assignments</Link>
      </div>

      <div className="navbar__status">
        <span className="status-dot" />
        <span>sandbox ready</span>
      </div>
    </nav>
  );
};

export default Navbar;
