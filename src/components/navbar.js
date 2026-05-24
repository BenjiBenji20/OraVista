import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
      <Link to="/" style={brandStyle} className="navbar-brand">OraVista</Link>
      
      <button 
        className="navbar-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <div className={`navbar-links ${isOpen ? 'menu-open' : ''}`} style={linkContainerStyle}>
        <Link to="/" style={getLinkStyle('/')} onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/about" style={getLinkStyle('/about')} onClick={() => setIsOpen(false)}>About Us</Link>
        <Link to="/services" style={getLinkStyle('/services')} onClick={() => setIsOpen(false)}>Services</Link>
        <Link to="/contact" style={getLinkStyle('/contact')} onClick={() => setIsOpen(false)}>Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;