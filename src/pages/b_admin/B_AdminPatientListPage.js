import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Search, Bell, MessageSquare, User, Eye, Edit, Plus, X, FileText, ExternalLink } from 'lucide-react';

function AdminPatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: Modal and Records states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/patients');
        const data = await response.json();

        if (Array.isArray(data)) {
          const patientData = data.map((patient) => ({
            dbId: patient.id, // Database ID for API calls[cite: 6]
            id: `PT-100${patient.id}`,
            name: patient.name,
            age: patient.age || '--',
            contact: patient.contact || 'No Contact',
            lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'No Visits'
          }));
          setPatients(patientData);
          setFilteredPatients(patientData);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const results = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contact.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(results);
  }, [searchQuery, patients]);

  // NEW: Fetch specific patient records for the modal[cite: 3]
  const handleViewRecords = async (e, patient) => {
    e.stopPropagation(); // Prevent row click navigation
    setSelectedPatient(patient);
    setIsModalOpen(true);
    try {
      const response = await fetch(`http://localhost:5000/api/patient-records/${patient.dbId}`);
      if (response.ok) {
        const data = await response.json();
        setPatientRecords(data);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const handleRowClick = (dbId) => {
    navigate(`/admin/patient-profile/${dbId}`);
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* --- NEW: RECORDS MODAL --- */}
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Records for {selectedPatient?.name}</h2>
                <X style={styles.closeIcon} onClick={() => setIsModalOpen(false)} />
              </div>
              <div style={styles.modalBody}>
                {patientRecords.length > 0 ? (
                  <table style={styles.recordTable}>
                    <thead>
                      <tr>
                        <th style={styles.recordTh}>File Name</th>
                        <th style={styles.recordTh}>Date</th>
                        <th style={styles.recordTh}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientRecords.map((rec) => (
                        <tr key={rec.id}>
                          <td style={styles.recordTd}><FileText size={16} style={{ marginRight: '8px' }} />{rec.file_name}</td>
                          <td style={styles.recordTd}>{new Date(rec.upload_date).toLocaleDateString()}</td>
                          <td style={styles.recordTd}>
                            <a href={`http://localhost:5000/${rec.file_path}`} target="_blank" rel="noreferrer" style={styles.viewLink}>
                              View <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No uploaded records found for this patient.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <header style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <input type="text" placeholder="Search header..." style={styles.searchInput} />
          </div>
          <div style={styles.headerActions}>
            <Bell size={20} color="white" style={styles.actionIcon} />
            <MessageSquare size={20} color="white" style={styles.actionIcon} />
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
            <div>
              <h1 style={styles.pageTitle}>Patients List</h1>
              <p style={styles.pageSubtitle}>Manage and view all patient records</p>
            </div>
          </div>

          <div style={styles.tableControls}>
            <div style={styles.innerSearch}>
              <Search size={16} color="#999" style={styles.innerSearchIcon} />
              <input
                type="text"
                placeholder="Search by name, ID, or contact..."
                style={styles.innerSearchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button style={styles.addButton}>
              <Plus size={18} style={{ marginRight: '8px' }} />
              Add New Patient
            </button>
          </div>

          <div style={styles.tableContainer}>
            {loading ? (
              <p style={{ padding: '20px', color: 'white' }}>Loading patients...</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.th}>Patient ID</th>
                    <th style={styles.th}>Patient Name</th>
                    <th style={styles.th}>Age</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Last Visit</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                    <tr
                      key={patient.dbId}
                      style={styles.tbodyRow}
                      onClick={() => handleRowClick(patient.dbId)}
                    >
                      <td style={styles.td}>{patient.id}</td>
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          <div style={styles.nameAvatar}></div>
                          {patient.name}
                        </div>
                      </td>
                      <td style={styles.td}>{patient.age}</td>
                      <td style={styles.td}>{patient.contact}</td>
                      <td style={styles.td}>{patient.lastVisit}</td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <Eye size={18} style={styles.viewIcon} onClick={(e) => handleViewRecords(e, patient)} />
                          <Edit size={18} style={styles.editIcon} />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'white' }}>No results found for "{searchQuery}"</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
  tableContainer: { backgroundColor: '#001166', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', color: 'white' },
  th: { textAlign: 'left', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600', opacity: 0.8 },
  td: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' },
  tbodyRow: { borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' },
  nameCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  nameAvatar: { width: '32px', height: '32px', backgroundColor: 'white', borderRadius: '50%', opacity: 0.9 },
  actionButtons: { display: 'flex', gap: '15px' },
  viewIcon: { cursor: 'pointer', opacity: 0.8 },
  editIcon: { cursor: 'pointer', opacity: 0.8 },
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '30px', borderRadius: '15px', width: '600px', maxWidth: '90%' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { color: '#001166', margin: 0, fontSize: '20px' },
  closeIcon: { cursor: 'pointer', color: '#666' },
  recordTable: { width: '100%', borderCollapse: 'collapse' },
  recordTh: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f0f2f5', color: '#001166' },
  recordTd: { padding: '12px', borderBottom: '1px solid #f0f2f5', color: '#444' },
  viewLink: { color: '#001166', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }
};

export default AdminPatientList;