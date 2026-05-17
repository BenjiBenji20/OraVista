import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

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
  };

  const linkContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
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
    };
  };

  return (
    <nav style={navbarStyle}>
      <Link to="/" style={brandStyle}>OraVista</Link>
      <div style={linkContainerStyle}>
        <Link to="/" style={getLinkStyle('/')}>Home</Link>
        <Link to="/about" style={getLinkStyle('/about')}>About Us</Link>
        <Link to="/services" style={getLinkStyle('/services')}>Services</Link>
        <Link to="/contact" style={getLinkStyle('/contact')}>Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;