import React, { useState } from 'react';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F7FE' }}>
      <Sidebar onToggle={(val) => setIsCollapsed(val)} />
      <main style={{ 
        marginLeft: isCollapsed ? '80px' : '260px', 
        flex: 1, 
        transition: 'margin-left 0.3s ease',
        height: '100vh',
        overflowY: 'auto' 
      }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;