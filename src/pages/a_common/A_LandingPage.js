import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Centered Card */}
      <div style={styles.card}>
        
        {/* Logo Placeholder */}
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}></div>
        </div>

        {/* Title Section */}
        <h1 style={styles.title}>OraVista</h1>
        <p style={styles.subtitle}>Dental Clinic Management System</p>

        {/* Action Button */}
        <button 
          onClick={() => navigate('/clinic/login')} 
          style={styles.button}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#001166';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#001166';
          }}
        >
          Click to Continue
        </button>

        {/* Footer */}
        <p style={styles.footer}>King Epres Dental Clinic</p>
      </div>
    </div>
  );
}

// --- Internal CSS Styles ---
const styles = {
  container: {
    backgroundColor: '#001166', // Deep Navy Blue
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: 'white',
    width: '500px',
    height: '450px', // Fixed height for that square-ish look
    borderRadius: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    textAlign: 'center',
    padding: '40px',
    position: 'relative'
  },
  logoContainer: {
    width: '80px',
    height: '80px',
    backgroundColor: '#e0e0e0', // Light grey background for logo box
    borderRadius: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px'
  },
  logoCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#001166' // Dark circle inside
  },
  title: {
    color: '#001166',
    fontSize: '48px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    letterSpacing: '-1px'
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    fontWeight: '400',
    margin: '0 0 40px 0'
  },
  button: {
    padding: '12px 40px',
    backgroundColor: 'white',
    border: '2px solid #001166',
    borderRadius: '30px',
    color: '#001166',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '50px' // Spacing to push footer down
  },
  footer: {
    position: 'absolute',
    bottom: '30px',
    color: '#aaa',
    fontSize: '12px'
  }
};

export default LandingPage;