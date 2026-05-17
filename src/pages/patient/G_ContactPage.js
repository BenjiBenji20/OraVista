import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

function ContactPage() {
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '60px auto',
      padding: '0 40px',
      fontFamily: "'Poppins', sans-serif",
      color: '#001166',
      textAlign: 'left'
    },
    header: {
      fontSize: '42px',
      fontWeight: '800',
      marginBottom: '40px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr 2fr',
      gap: '50px',
      marginBottom: '60px'
    },
    sectionTitle: {
      fontSize: '22px',
      fontWeight: '800',
      marginBottom: '25px',
    },
    description: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: '#333',
      marginBottom: '30px'
    },
    socialLinks: {
      display: 'flex',
      gap: '15px',
      marginTop: '20px'
    },
    linkList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    linkItem: {
      fontSize: '16px',
      marginBottom: '15px',
      cursor: 'pointer',
      color: '#001166',
      fontWeight: '500'
    },
    contactInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
    },
    locationGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    locationTitle: {
      fontSize: '18px',
      fontWeight: '800',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    infoItem: {
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#333'
    },
    footerLine: {
      borderTop: '3px solid #001166',
      paddingTop: '20px',
      marginTop: '40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
      color: '#333'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Contact Us</h1>

      <div style={styles.grid}>
        {/* Clinic Info */}
        <div>
          <h2 style={styles.sectionTitle}>King Epres Dental Clinic</h2>
          <p style={styles.description}>
            At King Epres Dental Clinic, every smile matters. We provide modern, compassionate dental care across all our branches to keep you healthy, confident, and smiling.
          </p>
          <h3 style={styles.sectionTitle}>Follow Us</h3>
          <div style={styles.socialLinks}>
            <Facebook size={24} />
            <Instagram size={24} />
            <Twitter size={24} />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 style={styles.sectionTitle}>Quick Links</h2>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}>Home</li>
            <li style={styles.linkItem}>AboutUs</li>
            <li style={styles.linkItem}>Services</li>
            <li style={styles.linkItem}>Appointment</li>
          </ul>
        </div>

        {/* Branches Info */}
        <div style={styles.contactInfo}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Pasay Branch */}
            <div style={styles.locationGroup}>
              <div style={styles.locationTitle}><MapPin size={18} color="#ff4d4d" /> Gil Puyat, Pasay</div>
              <div style={styles.infoItem}><Phone size={14} /> Phone: +63 9XX XXX XXXX</div>
              <div style={styles.infoItem}><Mail size={14} /> Email: info@yourwebsite.com</div>
            </div>

            {/* Pampanga Branch */}
            <div style={styles.locationGroup}>
              <div style={styles.locationTitle}><MapPin size={18} color="#ff4d4d" /> Angeles, Pampanga</div>
              <div style={styles.infoItem}><Phone size={14} /> Phone: +63 9XX XXX XXXX</div>
              <div style={styles.infoItem}><Mail size={14} /> Email: info@yourwebsite.com</div>
            </div>
          </div>

          {/* Manila Branch */}
          <div style={styles.locationGroup}>
            <div style={styles.locationTitle}><MapPin size={18} color="#ff4d4d" /> Sta. Ana, Manila</div>
            <div style={styles.infoItem}><Phone size={14} /> Phone: +63 9XX XXX XXXX</div>
            <div style={styles.infoItem}><Mail size={14} /> Email: info@yourwebsite.com</div>
          </div>
        </div>
      </div>

      <div style={styles.footerLine}>
        <div>© 2026 King Epres Dental Clinic. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Terms Of Service</span>
          <span>Privacy Policy</span>
          <span>Cookie Policy</span>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;