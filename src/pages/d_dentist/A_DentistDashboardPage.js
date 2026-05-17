import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Bell, MessageSquare, User } from 'lucide-react';

function DentistDashboard() {
  // UPDATED: State management for real-time database data mirrored from Admin/Staff
  const [stats, setStats] = useState({
    todayCount: 0,
    availableDentists: 0,
    totalDentists: 0,
    monthPatients: 0,
    schedule: []
  });
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Clock update logic for the dashboard
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('https://oravista-server-temporary-754963692967.asia-southeast1.run.app/api/dashboard/stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dentist dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* HEADER - Dentist Specific Profile */}
        <header style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <input type="text" placeholder="Search patients, appointments..." style={styles.searchInput} />
          </div>
          <div style={styles.headerActions}>
            <Bell size={20} color="white" />
            <MessageSquare size={20} color="white" />
            <div style={styles.profile}>
              <div style={styles.profileText}>
                <p style={styles.userName}>Dr. Smith</p>
                <p style={styles.userRole}>Dentist</p>
              </div>
              <div style={styles.avatar}><User size={20} color="#001166" /></div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={styles.content}>

          {/* TOP STAT CARDS - Now functional and mirrored */}
          <div style={styles.gridTop}>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Today's Appointments</p>
              <h2 style={styles.cardValue}>{loading ? "..." : stats.todayCount}</h2>
              <div style={styles.progressBase}>
                <div style={{ ...styles.progressFill, width: `${Math.min((stats.todayCount / 50) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Current Date</p>
              <h2 style={{ ...styles.cardValue, fontSize: '18px' }}>
                {currentDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p style={styles.cardSub}>{currentDateTime.toLocaleTimeString()}</p>
            </div>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Dentist Availability</p>
              <h2 style={styles.cardValue}>{loading ? "..." : `${stats.availableDentists}/${stats.totalDentists}`}</h2>
              <p style={styles.cardSub}>Available now</p>
            </div>
            <div style={styles.card}>
              <p style={styles.cardLabel}>Patients This Month</p>
              <h2 style={styles.cardValue}>{loading ? "..." : stats.monthPatients}</h2>
              <p style={styles.cardSub}>Monthly growth tracked</p>
            </div>
          </div>

          {/* ANALYTICS GRID */}
          <div style={styles.gridMid}>
            <div style={styles.chartCard}>
              <p style={styles.sectionTitle}>Revenue Overview</p>
              <div style={styles.placeholder}>Chart Placeholder</div>
            </div>
            <div style={styles.chartCard}>
              <p style={styles.sectionTitle}>Patient Growth</p>
              <div style={styles.placeholder}>Chart Placeholder</div>
            </div>
          </div>

          {/* LOWER GRID: VISITS & SCHEDULE */}
          <div style={styles.gridBottom}>
            <div style={styles.listCard}>
              <p style={styles.sectionTitle}>Recent Patient Visits</p>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={styles.patientRow}>
                  <div style={styles.pAvatar}></div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.pName}>Recent Visitor {i}</p>
                    <p style={styles.pId}>ID: PT-100{i}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={styles.pType}>Consultation</p>
                    <p style={styles.pTime}>{i * 2}h ago</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.scheduleCard}>
              <p style={styles.sectionTitle}>Today's Schedule</p>
              {loading ? (
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading schedule...</p>
              ) : stats.schedule.length > 0 ? (
                stats.schedule.slice(0, 5).map((item, idx) => (
                  <div key={idx} style={styles.scheduleRow}>
                    <div style={styles.sDot}></div>
                    <div style={styles.sText}>
                      <p style={styles.sTime}>{item.time}</p>
                      <p style={styles.sName}>{item.patientName}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>No appointments assigned.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', width: '100%' },
  header: { height: '80px', background: '#001166', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 10 },
  searchBox: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', width: '350px' },
  searchInput: { border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%', color: 'white' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '25px' },
  profile: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' },
  profileText: { textAlign: 'right' },
  userName: { margin: 0, fontWeight: 'bold', fontSize: '14px', color: 'white' },
  userRole: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
  avatar: { width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  content: { padding: '30px', backgroundColor: '#F4F7FE' },
  gridTop: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' },
  card: { padding: '25px', borderRadius: '20px', color: 'white', background: '#001166' },
  cardLabel: { fontSize: '12px', opacity: 0.8, marginBottom: '10px' },
  cardValue: { margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' },
  progressBase: { height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' },
  progressFill: { height: '100%', background: '#00d4ff', borderRadius: '3px' },
  cardSub: { fontSize: '11px', margin: 0, opacity: 0.8 },

  gridMid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' },
  chartCard: { background: '#001166', borderRadius: '20px', padding: '25px', color: 'white' },
  placeholder: { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.2)', marginTop: '15px', borderRadius: '12px', color: 'rgba(255,255,255,0.4)' },
  sectionTitle: { margin: '0 0 20px 0', fontWeight: 'bold', fontSize: '16px', color: 'white' },

  gridBottom: { display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '20px' },
  listCard: { borderRadius: '20px', padding: '25px', background: '#001166', color: 'white' },
  patientRow: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  pAvatar: { width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' },
  pName: { margin: 0, fontWeight: '600', fontSize: '14px' },
  pId: { margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' },
  pType: { margin: 0, fontSize: '13px' },
  pTime: { margin: 0, fontSize: '11px', opacity: 0.4 },

  scheduleCard: { background: '#001166', borderRadius: '20px', padding: '25px', color: 'white' },
  scheduleRow: { background: 'white', color: '#001166', padding: '12px 20px', borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '15px' },
  sDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,17,102,0.3)' },
  sTime: { margin: 0, fontWeight: 'bold', fontSize: '13px' },
  sName: { margin: 0, fontSize: '13px' }
};

export default DentistDashboard;