import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Search, Bell, MessageSquare, User, Download, MapPin, Loader2 } from "lucide-react";

function AdminDashboard() {
  // States for dynamic clinic data
  const [appointments, setAppointments] = useState([]);
  const [branchEarnings, setBranchEarnings] = useState({});
  const [stats, setStats] = useState({
    todayCount: 0,
    totalAppointments: 0,
    availableDentists: 3,
    totalDentists: 3,
    monthPatients: 0,
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Centralized Clinic Overview: Fetching stats and operational workflow[cite: 6]
        const statsRes = await fetch('https://oravista-server-temporary-754963692967.asia-southeast1.run.app/api/dashboard/stats');

        // 2. Daily Earnings: Fetching real-time revenue per each branch[cite: 6]
        const earningsRes = await fetch('https://oravista-server-temporary-754963692967.asia-southeast1.run.app/api/dashboard/branch-earnings');

        if (statsRes.ok && earningsRes.ok) {
          const statsData = await statsRes.json();
          const earningsData = await earningsRes.json();

          setStats({
            todayCount: statsData.todayCount,
            totalAppointments: statsData.schedule.length,
            availableDentists: 3,
            totalDentists: 3,
            monthPatients: statsData.monthPatients,
            loading: false
          });

          // 3. Schedule Monitoring: Tracking upcoming patient visits[cite: 6]
          setAppointments(statsData.schedule);
          setBranchEarnings(earningsData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  // NEW: Generate Report Functionality
  const handleGenerateReport = () => {
    alert("Generating comprehensive daily report based on live branch operations...");
  };

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
            {/* Generate Report Button */}
            <button style={styles.reportBtn} onClick={handleGenerateReport}>
              <Download size={16} />
              Generate Report
            </button>
            <Bell size={20} color="white" style={styles.actionIcon} />
            <MessageSquare size={20} color="white" style={styles.actionIcon} />
            <div style={styles.profile}>
              <div style={styles.profileText}>
                <p style={styles.userName}>Admin User</p>
                <p style={styles.userRole}>Administrator</p>
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

            {/* CARD 1: TOTAL APPOINTMENTS */}
            <div style={styles.card}>
              <p style={styles.cardLabel}>Total Appointments</p>
              <h2 style={styles.cardValue}>{stats.totalAppointments}</h2>
              <div style={styles.progressBase}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min((stats.totalAppointments / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* CARD 2: CURRENT DATE */}
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
            {/* CENTRALIZED BRANCH REVENUE Overview */}
            <div style={styles.chartCard}>
              <p style={styles.sectionTitle}>Daily Earnings (Per Branch)</p>
              <div style={styles.earningsContainer}>
                {Object.keys(branchEarnings).length > 0 ? (
                  Object.entries(branchEarnings).map(([branch, amount], index) => (
                    <div key={index} style={styles.earningRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={styles.iconCircle}>
                          <MapPin size={18} color="#001166" />
                        </div>
                        <p style={styles.branchName}>{branch}</p>
                      </div>
                      <h3 style={styles.earningAmount}>₱{parseFloat(amount).toLocaleString()}</h3>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', opacity: 0.5 }}>No earnings recorded today.</p>
                )}
              </div>
            </div>

            <div style={styles.chartCard}>
              <p style={styles.sectionTitle}>Patient Growth</p>
              <div style={styles.placeholder}>Growth Analytics</div>
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
                    <p style={styles.pTime}>Active Session</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SCHEDULE MONITORING LIST */}
            <div style={{ ...styles.listCard, background: "#001166" }}>
              <p style={styles.sectionTitle}>Today's Schedule</p>

              {stats.loading ? (
                <p style={{ color: 'white', opacity: 0.6 }}>Loading schedule...</p>
              ) : appointments.length > 0 ? (
                appointments.map((item, idx) => (
                  <div key={idx} style={styles.scheduleRow}>
                    <span style={{ flex: 1 }}>{item.time} - {item.patientName}</span>
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
                  No appointments scheduled.
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

  reportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "white",
    color: "#001166",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
  },

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
    display: "flex",
    flexDirection: "column",
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

  earningsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    flexGrow: 1,
    justifyContent: "center",
  },
  earningRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.05)",
    padding: "15px 20px",
    borderRadius: "12px",
  },
  iconCircle: {
    background: "white",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  branchName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
  },
  earningAmount: {
    margin: 0,
    fontSize: "20px",
    color: "#10b981",
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

export default AdminDashboard;