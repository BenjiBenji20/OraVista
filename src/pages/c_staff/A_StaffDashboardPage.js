import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Search, Bell, MessageSquare, User } from "lucide-react";

function StaffDashboard() {
  // Mirroring Admin State structure
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    availableDentists: 3, 
    totalDentists: 3,     
    monthPatients: 0, 
    loading: true 
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetching from your Node.js server
        const response = await fetch('http://localhost:5000/api/dashboard/stats');
        
        if (!response.ok) {
           throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        // Update stats mirroring Admin logic
        setStats({
          todayCount: data.todayCount,
          availableDentists: 3, 
          totalDentists: 3,     
          monthPatients: data.monthPatients,
          loading: false
        });

        // Update Today's Schedule List
        setAppointments(data.schedule);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              style={styles.searchInput}
            />
          </div>
          <div style={styles.headerActions}>
            <Bell size={20} color="white" style={styles.actionIcon} />
            <MessageSquare size={20} color="white" style={styles.actionIcon} />
            <div style={styles.profile}>
              <div style={styles.profileText}>
                <p style={styles.userName}>Staff User</p>
                <p style={styles.userRole}>Receptionist</p>
              </div>
              <div style={styles.avatar}>
                <User size={20} color="#001166" />
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div style={styles.content}>
          <div style={styles.gridTop}>
            
            {/* CARD 1: TODAY'S APPOINTMENTS */}
            <div style={styles.card}>
              <p style={styles.cardLabel}>Today's Appointments</p>
              <h2 style={styles.cardValue}>{stats.todayCount}</h2>
              <div style={styles.progressBase}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min((stats.todayCount / 20) * 100, 100)}%`, 
                  }}
                ></div>
              </div>
            </div>

            <div style={styles.card}>
              <p style={styles.cardLabel}>Current Date</p>
              <h2 style={{ ...styles.cardValue, fontSize: "18px" }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
            </div>

            {/* CARD 3: DENTIST AVAILABILITY */}
            <div style={styles.card}>
              <p style={styles.cardLabel}>Dentist Availability</p>
              <h2 style={styles.cardValue}>
                {stats.availableDentists}/{stats.totalDentists}
              </h2>
              <p style={styles.cardSub}>Available now</p>
            </div>

            {/* CARD 4: PATIENTS THIS MONTH */}
            <div style={styles.card}>
              <p style={styles.cardLabel}>Patients This Month</p>
              <h2 style={styles.cardValue}>{stats.monthPatients}</h2>
              <p style={styles.cardSub}>Monthly growth</p>
            </div>
          </div>

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

          <div style={styles.gridBottom}>
            <div style={styles.listCard}>
              <p style={{ ...styles.sectionTitle, color: "white" }}>
                Recent Patient Visits
              </p>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={styles.patientRow}>
                  <div style={styles.pAvatar}></div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.pName}>Patient Name {i}</p>
                    <p style={styles.pId}>ID: PT-100{i}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={styles.pType}>Check-up</p>
                    <p style={styles.pTime}>2h ago</p>
                  </div>
                </div>
              ))}
            </div>

            {/* TODAY'S SCHEDULE LIST */}
            <div style={{ ...styles.listCard, background: "#001166" }}>
              <p style={styles.sectionTitle}>Today's Schedule</p>
              
              {stats.loading ? (
                <p style={{color: 'white', opacity: 0.6}}>Loading schedule...</p>
              ) : appointments.length > 0 ? (
                appointments.map((item, idx) => (
                  <div key={idx} style={styles.scheduleRow}>
                    <span style={{flex: 1}}>{item.time} - {item.patientName}</span>
                    <span style={{
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        background: item.status === 'Confirmed' ? '#e6fffa' : '#fff7ed',
                        color: item.status === 'Confirmed' ? '#047857' : '#c2410c'
                    }}>
                        {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "14px", opacity: 0.6 }}>
                  No appointments scheduled for today.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", width: "100%" },
  header: {
    height: "80px",
    background: "#001166",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.1)",
    padding: "10px 20px",
    borderRadius: "12px",
    width: "350px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    marginLeft: "10px",
    outline: "none",
    width: "100%",
    color: "white",
  },
  headerActions: { display: "flex", alignItems: "center", gap: "25px" },
  actionIcon: { cursor: "pointer", opacity: 0.9 },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderLeft: "1px solid rgba(255,255,255,0.2)",
    paddingLeft: "20px",
  },
  profileText: { textAlign: "right" },
  userName: { margin: 0, fontWeight: "bold", fontSize: "14px", color: "white" },
  userRole: { margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.6)" },
  avatar: {
    width: "40px",
    height: "40px",
    background: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  content: { padding: "30px" },
  gridTop: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },
  card: {
    padding: "25px",
    borderRadius: "20px",
    color: "white",
    background: "#001166",
  },
  cardLabel: { fontSize: "12px", opacity: 0.8, marginBottom: "10px" },
  cardValue: { margin: "0 0 10px 0", fontSize: "24px", fontWeight: "bold" },
  progressBase: {
    height: "6px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "3px",
  },
  progressFill: { height: "100%", background: "#00d4ff", borderRadius: "3px" },
  cardSub: { fontSize: "11px", margin: 0, opacity: 0.8 },

  gridMid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: "20px",
    marginBottom: "25px",
  },
  chartCard: {
    background: "#001166",
    borderRadius: "20px",
    padding: "25px",
    color: "white",
  },
  placeholder: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(255,255,255,0.2)",
    marginTop: "15px",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.4)",
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    fontWeight: "bold",
    fontSize: "16px",
    color: "white",
  },

  gridBottom: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: "20px",
  },
  listCard: {
    borderRadius: "20px",
    padding: "25px",
    background: "#001166",
    color: "white",
  },
  patientRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  pAvatar: {
    width: "40px",
    height: "40px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
  },
  pName: { margin: 0, fontWeight: "600", fontSize: "14px", color: "white" },
  pId: { margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.5)" },
  pType: { margin: 0, fontSize: "13px", fontWeight: "500", color: "white" },
  pTime: { margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)" },
  scheduleRow: {
    background: "white",
    color: "#001166",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
};

export default StaffDashboard;