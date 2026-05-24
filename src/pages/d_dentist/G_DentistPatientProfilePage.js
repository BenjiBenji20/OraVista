import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {
  Search, Bell, MessageSquare, User, Mail, Phone, MapPin,
  Calendar, Edit, Download, FileText, X, ExternalLink, Clock
} from 'lucide-react';
import AIDiagnosticModal from '../../components/AIDiagnosticModal';
import { exportPatientPDF } from '../../utils/exportPDF';

function DentistPatientProfile() {
  const { id } = useParams();

  // State Management
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [records, setRecords] = useState([]); // State for documents[cite: 3]
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeRecordForModal, setActiveRecordForModal] = useState(null);
  const [formData, setFormData] = useState({
    blood_type: '',
    allergies: '',
    insurance: '',
    policy_number: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Data from Backend
  const fetchPatientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const dbId = id.replace('PT-100', '');

      // Fetch Basic Info[cite: 4, 9]
      const response = await fetch(`http://localhost:5000/api/patients`);
      const allPatients = await response.json();
      const currentPatient = allPatients.find(p => p.id.toString() === dbId);

      if (currentPatient) {
        setPatient(currentPatient);
        setFormData({
          blood_type: currentPatient.blood_type || 'O+',
          allergies: currentPatient.allergies || 'None',
          insurance: currentPatient.insurance || 'None',
          policy_number: currentPatient.policy_number || 'N/A'
        });

        // Fetch Visit History[cite: 4, 9]
        const historyRes = await fetch(`http://localhost:5000/api/user-appointments/${dbId}`);
        const historyData = await historyRes.json();
        setHistory(historyData);

        // Fetch Patient Uploaded Records[cite: 3]
        console.log(`Fetching records for patient ID: ${dbId}`);
        const recordsRes = await fetch(`http://localhost:5000/api/patient-records/${dbId}`);
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setRecords(recordsData);
          console.log("Fetched patient records:", recordsData);
        }
      }
    } catch (err) {
      console.error("Error fetching patient profile:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatientDetails();
  }, [fetchPatientDetails]);

  // Handle Profile Update[cite: 4, 9]
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportPatientPDF(patient, formData, history, records);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to export patient clinical report.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const dbId = id.replace('PT-100', '');
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: dbId,
          firstName: patient.name.split(' ')[0],
          lastName: patient.name.split(' ')[1] || '',
          email: patient.email || ''
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchPatientDetails();
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (loading) return <AdminLayout><div style={styles.loading}>Loading Profile...</div></AdminLayout>;
  if (!patient) return <AdminLayout><div style={styles.loading}>Patient not found.</div></AdminLayout>;

  // Get earliest record (index 0) and check if it has clinical notes
  const earliestRecord = records[0];
  const hasClinicalNotes = earliestRecord && earliestRecord.clinical_notes && earliestRecord.clinical_notes.trim() !== "";

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <input type="text" placeholder="Search..." style={styles.searchInput} />
          </div>
          <div style={styles.headerActions}>
            <Bell size={20} color="white" style={styles.actionIcon} />
            <MessageSquare size={20} color="white" style={styles.actionIcon} />
            <div style={styles.profileHeader}>
              <div style={styles.profileText}>
                <p style={styles.userName}>Dr. {patient.dentist_name || 'Dentist'}</p>
                <p style={styles.userRole}>Dentist</p>
              </div>
              <div style={styles.avatar}><User size={20} color="#001166" /></div>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          <div style={styles.topRow}>
            <div>
              <h1 style={styles.pageTitle}>Patient Profile</h1>
              <p style={styles.pageSubtitle}>Clinical review of patient information and history</p>
            </div>
            <button style={styles.editProfileBtn} onClick={() => setShowEditModal(true)}>
              <Edit size={16} style={{ marginRight: '8px' }} /> Edit Clinical Info
            </button>
          </div>

          <div style={styles.dashboardGrid}>
            {/* LEFT COLUMN: Overview & Medical */}
            <div style={styles.leftCol}>
              <div style={styles.mainCard}>
                <div style={styles.profileSection}>
                  <div style={styles.largeAvatar}><User size={50} color="#001166" /></div>
                  <h2 style={styles.patientNameDisplay}>{patient.name}</h2>
                  <p style={styles.patientIdDisplay}>Patient ID: {id}</p>
                </div>
                <div style={styles.infoList}>
                  <div style={styles.infoItem}><Mail size={16} /> {patient.email || 'No email provided'}</div>
                  <div style={styles.infoItem}><Phone size={16} /> {patient.contact || 'No phone provided'}</div>
                  <div style={styles.infoItem}><MapPin size={16} /> STI Sta. Mesa, Manila</div>
                  <div style={styles.infoItem}><Calendar size={16} /> Age: {patient.age}</div>
                </div>
              </div>

              <div style={styles.mainCard}>
                <h3 style={styles.cardTitle}>Medical Information</h3>
                <div style={styles.medicalGrid}>
                  <div><p style={styles.medLabel}>Blood Type</p><p style={styles.medValue}>{formData.blood_type}</p></div>
                  <div><p style={styles.medLabel}>Allergies</p><p style={styles.medValue}>{formData.allergies}</p></div>
                  <div><p style={styles.medLabel}>Insurance</p><p style={styles.medValue}>{formData.insurance}</p></div>
                  <div><p style={styles.medLabel}>Policy #</p><p style={styles.medValue}>{formData.policy_number}</p></div>
                </div>
              </div>

              <div style={{ ...styles.mainCard, background: '#000d4d' }}>
                <h3 style={styles.cardTitle}>Quick Stats</h3>
                <div style={styles.statsRow}>
                  <span>Total Visits</span>
                  <span style={styles.statNumber}>{history.length}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: History, Records & Notes */}
            <div style={styles.rightCol}>
              {/* Visit History[cite: 4, 9] */}
              <div style={styles.whiteCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitleBlack}>Visit History</h3>
                  <button 
                    style={styles.exportBtn} 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    <Download size={14} /> {isExporting ? 'Exporting...' : 'Export'}
                  </button>
                </div>
                <table style={styles.dataTable}>
                  <thead>
                    <tr>
                      <th style={styles.thBlack}>Date</th>
                      <th style={styles.thBlack}>Service</th>
                      <th style={styles.thBlack}>Dentist</th>
                      <th style={styles.thBlack}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((visit, idx) => (
                      <tr key={idx} style={styles.trBlack}>
                        <td style={styles.tdPadding}>{new Date(visit.appointment_date).toLocaleDateString()}</td>
                        <td style={styles.tdPadding}>{visit.service_type}</td>
                        <td style={styles.tdPadding}>{visit.dentist_name}</td>
                        <td style={styles.tdPadding}><span style={styles.statusBadge}>{visit.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PATIENT DOCUMENTS TABLE[cite: 3] */}
              <div style={styles.whiteCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitleBlack}>Patient Documents (X-Rays/Records)</h3>
                </div>
                {records.length > 0 ? (
                  <table style={styles.dataTable}>
                    <thead>
                      <tr>
                        <th style={styles.thBlack}>File Name</th>
                        <th style={styles.thBlack}>Upload Date</th>
                        <th style={styles.thBlack}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec, idx) => (
                        <tr key={rec.file_path || idx} style={styles.trBlack}>
                          <td style={{ ...styles.tdPadding, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={16} color="#001166" />
                            {rec.file_name}
                          </td>
                          <td style={styles.tdPadding}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
                              <Clock size={14} />
                              {new Date(rec.upload_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={styles.tdPadding}>
                            <button
                              onClick={() => setActiveRecordForModal(rec)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#001166',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: 0,
                                fontFamily: 'inherit',
                                fontSize: 'inherit'
                              }}
                            >
                              View <ExternalLink size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#999', fontSize: '14px', padding: '10px 0' }}>No clinical documents uploaded by patient.</p>
                )}
              </div>

              {/* Treatment Notes */}
              <div style={styles.notesCard}>
                <h3 style={styles.cardTitle}>Treatment Notes</h3>
                {hasClinicalNotes ? (
                  <div style={styles.noteItem}>
                    <p style={styles.noteContent}>{earliestRecord.clinical_notes}</p>
                  </div>
                ) : (
                  <p style={{ opacity: 0.6, fontSize: '14px' }}>No treatment notes available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* EDIT MEDICAL MODAL[cite: 4, 9] */}
        {showEditModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ color: '#001166', margin: 0 }}>Update Clinical Profile</h2>
                <X onClick={() => setShowEditModal(false)} style={{ cursor: 'pointer' }} />
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Blood Type</label>
                    <input type="text" value={formData.blood_type} onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })} style={styles.modalInput} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Allergies</label>
                    <input type="text" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} style={styles.modalInput} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Insurance</label>
                    <input type="text" value={formData.insurance} onChange={(e) => setFormData({ ...formData, insurance: e.target.value })} style={styles.modalInput} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Policy Number</label>
                    <input type="text" value={formData.policy_number} onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })} style={styles.modalInput} />
                  </div>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>Save Clinical Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <AIDiagnosticModal
          isOpen={!!activeRecordForModal}
          onClose={() => setActiveRecordForModal(null)}
          record={activeRecordForModal}
        />
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f9' },
  header: { height: '80px', background: '#001166', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 10 },
  searchBox: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', width: '300px' },
  searchInput: { border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%', color: 'white' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '25px' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' },
  profileText: { textAlign: 'right' },
  userName: { margin: 0, fontWeight: 'bold', fontSize: '14px', color: 'white' },
  userRole: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
  avatar: { width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loading: { color: '#001166', padding: '40px', fontWeight: 'bold' },

  content: { padding: '40px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '800', color: '#001166', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#666' },
  editProfileBtn: { backgroundColor: '#001166', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  dashboardGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' },
  mainCard: { background: '#001166', borderRadius: '25px', padding: '30px', color: 'white', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,17,102,0.1)' },
  profileSection: { textAlign: 'center', marginBottom: '30px' },
  largeAvatar: { width: '100px', height: '100px', backgroundColor: 'white', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  patientNameDisplay: { fontSize: '24px', fontWeight: '800', margin: '0 0 5px 0' },
  patientIdDisplay: { fontSize: '14px', opacity: 0.7 },
  infoList: { display: 'flex', flexDirection: 'column', gap: '18px' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', opacity: 0.9 },

  cardTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0' },
  cardTitleBlack: { fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0', color: '#001166' },
  medicalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  medLabel: { fontSize: '11px', opacity: 0.6, margin: '0 0 5px 0', textTransform: 'uppercase' },
  medValue: { fontSize: '14px', fontWeight: '600', margin: 0 },
  statsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statNumber: { fontSize: '28px', fontWeight: '800' },

  rightCol: { display: 'flex', flexDirection: 'column', gap: '30px' },
  whiteCard: { background: 'white', borderRadius: '25px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  exportBtn: { background: 'none', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#666' },
  dataTable: { width: '100%', borderCollapse: 'collapse' },
  thBlack: { textAlign: 'left', padding: '15px', borderBottom: '2px solid #f0f2f8', color: '#001166', fontSize: '14px' },
  trBlack: { borderBottom: '1px solid #f0f2f8', fontSize: '14px', color: '#444' },
  tdPadding: { padding: '15px' },
  statusBadge: { backgroundColor: '#e6fffa', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '11px' },
  viewLink: { color: '#001166', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' },

  notesCard: { background: '#001166', borderRadius: '25px', padding: '30px', color: 'white' },
  noteItem: { background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px', marginBottom: '20px' },
  noteHeader: { display: 'flex', gap: '15px', marginBottom: '15px' },
  noteIcon: { width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  noteTitle: { fontSize: '15px', fontWeight: '700', margin: 0 },
  noteDate: { fontSize: '12px', opacity: 0.6, margin: 0 },
  noteContent: { fontSize: '14px', opacity: 0.8, marginBottom: '15px' },
  noteActions: { display: 'flex', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' },
  noteBtn: { background: 'none', border: 'none', color: 'white', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { background: 'white', padding: '40px', borderRadius: '25px', width: '550px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#666' },
  modalInput: { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  modalActions: { display: 'flex', gap: '15px' },
  cancelBtn: { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontWeight: '700', cursor: 'pointer', background: 'white' },
  saveBtn: { flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#001166', color: 'white', fontWeight: '700', cursor: 'pointer' },
};

export default DentistPatientProfile;