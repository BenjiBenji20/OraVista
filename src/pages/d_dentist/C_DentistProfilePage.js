import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Bell, MessageSquare, User } from 'lucide-react';

function DentistProfile() {
  // NEW: State for dynamic database data
  const [dentistData, setDentistData] = useState(null);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDentistProfile = async () => {
      try {
        // Assuming user ID is stored in localStorage after login
        const user = JSON.parse(localStorage.getItem('user'));
        const dentistId = user?.id;

        if (!dentistId) return;

        // Fetching dentist-specific data from your backend
        const response = await fetch(`https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/dentist-profile/${dentistId}`);
        const data = await response.json();

        setDentistData(data.profile);
        setAssignedPatients(data.patients || []);
        setSchedule(data.schedule || []);
      } catch (err) {
        console.error("Error fetching dentist profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDentistProfile();
  }, []);

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* HEADER */}
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
                <p style={styles.userName}>{dentistData ? `Dr. ${dentistData.last_name}` : 'Loading...'}</p>
                <p style={styles.userRole}>Dentist</p>
              </div>
              <div style={styles.avatar}><User size={20} color="#001166" /></div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Dentist Profile</h1>
            <p style={styles.pageSubtitle}>Detailed information and performance overview</p>
          </div>

          {loading ? (
            <p style={{ color: '#001166' }}>Loading data from database...</p>
          ) : (
            <div style={styles.dashboardGrid}>
              {/* CARD 1: PROFILE */}
              <div style={styles.card}>
                <div style={styles.profileTop}>
                  <div style={styles.avatarLarge}>
                    <User size={50} color="#001166" style={{ marginTop: '25px' }} />
                  </div>
                  <h2 style={styles.dentistName}>Dr. {dentistData?.first_name} {dentistData?.last_name}</h2>
                  <p style={styles.dentistId}>ID: DT-10{dentistData?.id}</p>
                  <p style={styles.dentistService}>{dentistData?.specialty}</p>
                  <span style={styles.activeBadge}>{dentistData?.status || 'Active'}</span>
                </div>
                <div style={styles.profileBottom}>
                  <div style={styles.contactItem}>
                    <p style={styles.contactLabel}>Email</p>
                    <p style={styles.contactValue}>{dentistData?.email}</p>
                  </div>
                  <div style={styles.contactItem}>
                    <p style={styles.contactLabel}>Phone</p>
                    <p style={styles.contactValue}>{dentistData?.phone || '+1 (555) 000-0000'}</p>
                  </div>
                </div>
              </div>

              {/* CARD 2: ASSIGNED PATIENTS */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Assigned Patients</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Patient Name</th>
                        <th style={styles.th}>Case Type</th>
                        <th style={styles.th}>Last Visit</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedPatients.length > 0 ? assignedPatients.map((p, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{p.name}</td>
                          <td style={styles.td}>{p.case_type}</td>
                          <td style={styles.td}>{new Date(p.last_visit).toLocaleDateString()}</td>
                          <td style={styles.td}>
                            <button style={styles.viewBtn}>View Profile</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', opacity: 0.5 }}>No assigned patients</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD 3: PERFORMANCE SUMMARY */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Performance Summary</h3>
                <div style={styles.summaryItem}>
                  <p style={styles.summaryLabel}>Total Patients</p>
                  <p style={styles.summaryValue}>{dentistData?.patient_count || 0}</p>
                </div>
                <div style={styles.summaryItem}>
                  <p style={styles.summaryLabel}>Procedures Completed</p>
                  <p style={styles.summaryValue}>{dentistData?.procedures_count || 0}</p>
                </div>
                <div style={styles.summaryItem}>
                  <p style={styles.summaryLabel}>Upcoming Appointments</p>
                  <p style={styles.summaryValue}>{schedule.length}</p>
                </div>
              </div>

              {/* CARD 4: TODAY'S SCHEDULE */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Today's Schedule</h3>
                <div style={styles.scheduleList}>
                  {schedule.length > 0 ? schedule.map((item, i) => (
                    <div key={i} style={styles.scheduleRow}>
                      <div style={styles.scheduleTime}>{item.time}</div>
                      <div style={styles.scheduleInfo}>
                        <p style={styles.schedulePatient}>{item.patientName}</p>
                        <p style={styles.scheduleCase}>{item.type || 'Consultation'}</p>
                      </div>
                    </div>
                  )) : (
                    <p style={{ opacity: 0.5, fontSize: '13px' }}>No appointments scheduled for today.</p>
                  )}
                </div>
              </div>
            </div>
          )}
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

  content: { padding: '40px', backgroundColor: '#F4F7FE' },
  pageHeader: { marginBottom: '30px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#666', marginTop: '5px' },

  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gridTemplateRows: 'auto auto', gap: '25px' },
  card: { backgroundColor: '#001166', borderRadius: '15px', padding: '30px', color: 'white' },

  profileTop: { textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '25px', marginBottom: '25px' },
  avatarLarge: { width: '100px', height: '100px', borderRadius: '50%', background: '#E8EAF6', margin: '0 auto 20px', textAlign: 'center' },
  dentistName: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  dentistId: { fontSize: '12px', opacity: 0.6, margin: '5px 0' },
  dentistService: { fontSize: '14px', margin: '10px 0' },
  activeBadge: { background: 'rgba(255,255,255,0.1)', padding: '4px 15px', borderRadius: '20px', fontSize: '11px' },
  profileBottom: { display: 'flex', flexDirection: 'column', gap: '15px' },
  contactLabel: { fontSize: '11px', opacity: 0.6, margin: 0 },
  contactValue: { fontSize: '13px', margin: '3px 0' },

  cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '25px', marginTop: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '11px', opacity: 0.6, paddingBottom: '15px', fontWeight: 'normal' },
  td: { fontSize: '12px', padding: '15px 0', borderTop: '1px solid rgba(255,255,255,0.05)' },
  viewBtn: { background: 'white', color: '#001166', border: 'none', padding: '5px 15px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' },

  summaryItem: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '15px' },
  summaryLabel: { fontSize: '11px', opacity: 0.6, margin: 0 },
  summaryValue: { fontSize: '22px', fontWeight: 'bold', margin: '5px 0 0 0' },

  scheduleRow: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '20px' },
  scheduleTime: { fontSize: '13px', fontWeight: 'bold', width: '80px' },
  schedulePatient: { fontSize: '13px', fontWeight: 'bold', margin: 0 },
  scheduleCase: { fontSize: '11px', opacity: 0.6, margin: '3px 0 0 0' }
};

export default DentistProfile;