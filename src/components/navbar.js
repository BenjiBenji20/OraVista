import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling on the body when the mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 3rem',
    width: '100%',
    boxSizing: 'border-box',
    position: 'absolute',
    top: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  };

  const brandStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#001166',
    textDecoration: 'none',
    fontFamily: "'Poppins', sans-serif",
    zIndex: 1100, // Keep above the overlay
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      textDecoration: 'none',
      fontSize: '18px',
      fontFamily: "'Poppins', sans-serif",
      color: '#001166',
      fontWeight: isActive ? '700' : '500',
      borderBottom: isActive ? '3px solid #001166' : '3px solid transparent',
      transition: 'all 0.3s ease',
      paddingBottom: '5px',
      width: 'max-content'
    };
  };

  return (
    <>
      <style>
        {`
          .navbar-mobile-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            color: #001166;
            z-index: 1100;
          }

          /* Container to push everything to the right */
          .navbar-right-section {
            display: flex;
            align-items: center;
            gap: 40px;
            margin-left: auto; /* Forces right alignment */
          }

          .navbar-links {
            display: flex;
            align-items: center;
            gap: 40px;
          }

          .profile-section {
            display: flex;
            align-items: center;
            gap: 15px;
            border-left: 2px solid rgba(0, 17, 102, 0.2);
            padding-left: 20px;
          }

          .desktop-profile-text {
            text-align: right;
            color: #001166;
            font-family: 'Poppins', sans-serif;
          }

          .user-name {
            margin: 0;
            font-weight: 700;
            font-size: 14px;
          }

          .user-role {
            margin: 0;
            font-size: 12px;
            opacity: 0.8;
          }

          .avatar {
            width: 40px;
            height: 40px;
            background: #001166;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          @media (max-width: 1024px) {
            .navbar-right-section {
              gap: 20px;
            }
            .navbar-links {
              gap: 20px;
            }
            .profile-section {
              padding-left: 15px;
            }
          }

          /* Mobile Responsive Styles */
          @media (max-width: 768px) {
            .navbar-container {
              padding: 1rem 1.5rem !important;
              justify-content: center !important; /* Centers brand on mobile */
            }
            
            .navbar-mobile-toggle {
              display: block;
              position: absolute;
              left: 1.5rem; /* Places hamburger on the left */
            }

            .navbar-right-section {
              position: fixed;
              top: 0;
              left: -100%; /* Start hidden off-screen */
              width: 280px;
              height: 100vh;
              background-color: white;
              flex-direction: column;
              align-items: flex-start;
              justify-content: flex-start;
              padding: 80px 30px 30px 30px;
              transition: left 0.3s ease-in-out;
              z-index: 1060;
              box-shadow: 5px 0 15px rgba(0,0,0,0.1);
              margin-left: 0;
              gap: 30px;
            }

            .navbar-right-section.menu-open {
              left: 0; /* Slide in */
            }

            .navbar-links {
              flex-direction: column;
              align-items: flex-start;
              gap: 25px;
              width: 100%;
            }

            .profile-section {
              border-left: none;
              border-top: 1px solid rgba(0, 17, 102, 0.1);
              padding-left: 0;
              padding-top: 20px;
              width: 100%;
              justify-content: flex-start;
            }

            .desktop-profile-text {
              text-align: left;
            }
          }
        `}
      </style>

      <nav style={navbarStyle} className="navbar-container">
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <Link to="/" style={brandStyle} className="navbar-brand">OraVista</Link>

        <div className={`navbar-right-section ${isOpen ? 'menu-open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" style={getLinkStyle('/')} onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/about" style={getLinkStyle('/about')} onClick={() => setIsOpen(false)}>About Us</Link>
            <Link to="/services" style={getLinkStyle('/services')} onClick={() => setIsOpen(false)}>Services</Link>
            <Link to="/contact" style={getLinkStyle('/contact')} onClick={() => setIsOpen(false)}>Contact</Link>
          </div>

          <div className="profile-section">
            <div className="desktop-profile-text">
              <p className="user-name">Admin User</p>
              <p className="user-role">Clinic Owner</p>
            </div>
            <div className="avatar">
              <User color="white" size={20} />
            </div>
          </div>
        </div>
      </nav>

      {/* Dimmed Overlay when menu is open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050,
          }}
        />
      )}
    </>
  );
}

export default Navbar;