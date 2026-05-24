import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Bell, MessageSquare, User, Eye, Edit, Plus } from 'lucide-react';

function AdminDentistList() {
  const [dentists, setDentists] = useState([]);
  const [filteredDentists, setFilteredDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState({ total: 0, available: 0, busy: 0, offDuty: 0 });

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        // Fetching real-time dentist data from your Node.js server[cite: 8]
        const response = await fetch('https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/dentists');
        const data = await response.json();

        if (Array.isArray(data)) {
          const formattedDentists = data.map(d => ({
            id: `DT-10${d.id}`,
            name: `Dr. ${d.first_name} ${d.last_name}`,
            // Using real data from the database[cite: 8]
            specialty: d.specialty || 'General Dentistry',
            patients: `${d.patient_count || 0} assigned`,
            status: d.status || 'Available',
            branch: d.branch || 'Main Branch'
          }));

          setDentists(formattedDentists);
          setFilteredDentists(formattedDentists);

          // Calculate summary stats dynamically based on the database results[cite: 8]
          setSummary({
            total: formattedDentists.length,
            available: formattedDentists.filter(d => d.status === 'Available').length,
            busy: formattedDentists.filter(d => d.status === 'Busy').length,
            offDuty: formattedDentists.filter(d => d.status === 'Off Duty').length,
          });
        }
      } catch (err) {
        console.error("Error fetching dentists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDentists();
  }, []);

  // Search Filter Logic for Name, Specialty, or ID
  useEffect(() => {
    const results = dentists.filter(dentist =>
      dentist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dentist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dentist.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDentists(results);
  }, [searchQuery, dentists]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { backgroundColor: '#10b981', color: 'white' };
      case 'Busy': return { backgroundColor: '#f59e0b', color: 'white' };
      case 'Off Duty': return { backgroundColor: '#6b7280', color: 'white' };
      default: return { backgroundColor: '#eee', color: '#333' };
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <input type="text" placeholder="Quick search..." style={styles.searchInput} />
          </div>
          <div style={styles.headerActions}>
            <Bell size={20} color="white" />
            <MessageSquare size={20} color="white" />
            <div style={styles.profile}>
              <div style={styles.profileText}>
                <p style={styles.userName}>Admin User</p>
                <p style={styles.userRole}>Administrator</p>
              </div>
              <div style={styles.avatar}><User size={20} color="#001166" /></div>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>Dentist Directory</h1>
            <p style={styles.pageSubtitle}>Centralized management of clinical staff and availability</p>
          </div>

          <div style={styles.tableControls}>
            <div style={styles.innerSearch}>
              <Search size={16} color="#999" style={styles.innerSearchIcon} />
              <input
                type="text"
                placeholder="Search by name, specialty, or ID..."
                style={styles.innerSearchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button style={styles.addButton}>
              <Plus size={18} style={{ marginRight: '8px' }} />
              Add New Dentist
            </button>
          </div>

          <div style={styles.tableContainer}>
            {loading ? (
              <p style={{ padding: '20px', color: 'white' }}>Synchronizing with database...</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>Dentist ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Specialty</th>
                    <th style={styles.th}>Patient Load</th>
                    <th style={styles.th}>Current Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDentists.length > 0 ? filteredDentists.map((dentist) => (
                    <tr key={dentist.id} style={styles.tbodyRow}>
                      <td style={styles.td}>{dentist.id}</td>
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          <div style={styles.nameAvatar}></div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '600' }}>{dentist.name}</p>
                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.6 }}>{dentist.branch}</p>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{dentist.specialty}</td>
                      <td style={styles.td}>{dentist.patients}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, ...getStatusStyle(dentist.status) }}>
                          {dentist.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <Eye size={18} style={styles.viewIcon} />
                          <Edit size={18} style={styles.editIcon} />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                        No records found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Total Staff</p>
              <h2 style={styles.summaryValue}>{summary.total}</h2>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Available</p>
              <h2 style={styles.summaryValue}>{summary.available}</h2>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>On-Call / Busy</p>
              <h2 style={styles.summaryValue}>{summary.busy}</h2>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Off Duty</p>
              <h2 style={styles.summaryValue}>{summary.offDuty}</h2>
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
  content: { padding: '40px' },
  titleSection: { marginBottom: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#001166', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#666', marginTop: '5px' },
  tableControls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  innerSearch: { position: 'relative', width: '300px' },
  innerSearchIcon: { position: 'absolute', left: '12px', top: '10px' },
  innerSearchInput: { width: '100%', padding: '10px 15px 10px 40px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
  addButton: { backgroundColor: '#001166', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', cursor: 'pointer' },
  tableContainer: { backgroundColor: '#001166', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '30px' },
  table: { width: '100%', borderCollapse: 'collapse', color: 'white' },
  th: { textAlign: 'left', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600', opacity: 0.8 },
  td: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' },
  nameCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  nameAvatar: { width: '32px', height: '32px', backgroundColor: 'white', borderRadius: '50%', opacity: 0.9 },
  statusBadge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  actionButtons: { display: 'flex', gap: '15px' },
  viewIcon: { cursor: 'pointer', opacity: 0.8 },
  editIcon: { cursor: 'pointer', opacity: 0.8 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  summaryCard: { backgroundColor: '#001166', borderRadius: '15px', padding: '20px', color: 'white' },
  summaryLabel: { fontSize: '12px', opacity: 0.8, marginBottom: '8px' },
  summaryValue: { fontSize: '24px', fontWeight: 'bold', margin: 0 }
};

export default AdminDentistList;