import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserRound, Calendar, 
  Stethoscope, UserPlus, Settings, LogOut, ChevronLeft, ChevronRight,
  ActivitySquare // NEW: Imported icon for Analytics
} from 'lucide-react';

const Sidebar = ({ onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("user")) || { role: "" };
  const role = user.role.toLowerCase();

  useEffect(() => {
    onToggle(isCollapsed);
  }, [isCollapsed, onToggle]);

  const menuConfig = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20}/> },
      { name: 'Patient List', path: '/admin/patients', icon: <Users size={20}/> },
      { name: 'Dentist List', path: '/admin/dentists', icon: <UserRound size={20}/> },
      { name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={20}/> },
      { name: 'Account Creation', path: '/admin/create-account', icon: <UserPlus size={20}/> },
      { name: 'Settings', path: '/admin/settings', icon: <Settings size={20}/> },
    ],
    staff: [
      { name: 'Dashboard', path: '/staff/dashboard', icon: <LayoutDashboard size={20}/> },
      { name: 'Patient List', path: '/staff/patients', icon: <Users size={20}/> },
      { name: 'Dentist List', path: '/staff/dentists', icon: <UserRound size={20}/> },
      { name: 'Appointments', path: '/staff/appointments', icon: <Calendar size={20}/> },
      { name: 'Settings', path: '/staff/settings', icon: <Settings size={20}/> },
    ],
    dentist: [
      { name: 'Dashboard', path: '/dentist/dashboard', icon: <LayoutDashboard size={20}/> },
      { name: 'Patient List', path: '/dentist/patients', icon: <Users size={20}/> },
      { name: 'Profile', path: '/dentist/profile', icon: <UserRound size={20}/> },
      { name: 'Appointments', path: '/dentist/appointments', icon: <Calendar size={20}/> },
      { name: 'Diagnostics', path: '/dentist/diagnostics', icon: <Stethoscope size={20}/> },
      // NEW: Added Predictive Analytics to Dentist Menu
      { name: 'Predictive Analytics', path: '/dentist/analytics', icon: <ActivitySquare size={20}/> },
      { name: 'Settings', path: '/dentist/settings', icon: <Settings size={20}/> },
    ]
  };

  const menuItems = menuConfig[role] || [];

  return (
    <div style={{...styles.sidebar, width: isCollapsed ? '80px' : '260px'}}>
      <button onClick={() => setIsCollapsed(!isCollapsed)} style={styles.toggleBtn}>
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div style={styles.logoSection}>
        <div style={styles.logoIcon}></div>
        {!isCollapsed && <h2 style={styles.logoText}>OraVista</h2>}
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={item.name} 
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                backgroundColor: isActive ? 'white' : 'transparent',
                color: isActive ? '#001166' : 'white',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              }}
            >
              {item.icon}
              {!isCollapsed && <span style={styles.navText}>{item.name}</span>}
            </div>
          );
        })}
      </nav>

      <div style={styles.logoutSection} onClick={() => { localStorage.clear(); window.location.href='/management'; }}>
        <div style={{...styles.navItem, justifyContent: isCollapsed ? 'center' : 'flex-start', color: 'white'}}>
          <LogOut size={20} />
          {!isCollapsed && <span style={styles.navText}>Log Out</span>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: { height: '100vh', backgroundColor: '#001166', display: 'flex', flexDirection: 'column', position: 'fixed', transition: 'width 0.3s ease', zIndex: 1000 },
  toggleBtn: { position: 'absolute', right: '-12px', top: '35px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoSection: { padding: '40px 20px', display: 'flex', alignItems: 'center', gap: '15px' },
  logoIcon: { width: '30px', height: '30px', backgroundColor: 'white', borderRadius: '8px' },
  logoText: { color: 'white', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  nav: { flex: 1, padding: '0 15px' },
  navItem: { display: 'flex', alignItems: 'center', padding: '12px 15px', borderRadius: '10px 0 0 10px', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s', fontSize: '14px' },
  navText: { marginLeft: '12px', fontWeight: '500' },
  logoutSection: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.1)' }
};

export default Sidebar;