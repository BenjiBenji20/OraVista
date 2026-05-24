import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Bell, MessageSquare, User, AlertCircle, CheckCircle2, X } from 'lucide-react';

function AdminAccountCreation() {
  const [accountType, setAccountType] = useState('dentist');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    email: '',
    password: 'TempPassword123!',
    branch: 'Gil Puyat, Pasay', // Added default branch
    specialty: 'General Dentistry' // Added default specialty
  });

  // Modal State
  const [modal, setModal] = useState({ show: false, type: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeModal = () => setModal({ show: false, type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom Validation Modal
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setModal({
        show: true,
        type: 'error',
        message: 'Missing Information: Please fill in all required fields marked with an asterisk.'
      });
      return;
    }

    try {
      // UPDATED: Pointing to the new Admin Create User endpoint
      const response = await fetch('https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: accountType,
          phone: formData.phone,
          dob: formData.dob,
          branch: formData.branch, // Added branch payload
          specialty: accountType === 'dentist' ? formData.specialty : null // Added specialty payload conditionally
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModal({
          show: true,
          type: 'success',
          message: `Success! The ${accountType} account has been created and a temporary password was generated.`
        });
        setFormData({ firstName: '', lastName: '', phone: '', dob: '', email: '', password: 'TempPassword123!', branch: 'Gil Puyat, Pasay', specialty: 'General Dentistry' });
      } else {
        setModal({ show: true, type: 'error', message: data.message || "Request Failed." });
      }
    } catch (err) {
      setModal({ show: true, type: 'error', message: "Connection Error: Could not reach the server." });
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* MODAL OVERLAY */}
        {modal.show && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <button onClick={closeModal} style={styles.modalClose}><X size={20} /></button>
              {modal.type === 'success' ? <CheckCircle2 size={48} color="#4ade80" /> : <AlertCircle size={48} color="#ff4d4d" />}
              <h3 style={styles.modalTitle}>{modal.type === 'success' ? 'Account Created' : 'Notice'}</h3>
              <p style={styles.modalText}>{modal.message}</p>
              <button onClick={closeModal} style={styles.modalBtn}>Close</button>
            </div>
          </div>
        )}

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
                <p style={styles.userName}>Admin User</p>
                <p style={styles.userRole}>Administrator</p>
              </div>
              <div style={styles.avatar}><User size={20} color="#001166" /></div>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>Account Creation</h1>
            <p style={styles.pageSubtitle}>Create new accounts for dentists or staff members</p>
          </div>

          <form style={styles.formCard} onSubmit={handleSubmit}>
            <p style={styles.fieldLabel}>Account Type <span style={{ color: '#ff4d4d' }}>*</span></p>
            <div style={styles.typeToggleGrid}>
              <div
                onClick={() => setAccountType('dentist')}
                style={{
                  ...styles.typeOption,
                  border: accountType === 'dentist' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: accountType === 'dentist' ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                <p style={styles.typeTitle}>Dentist</p>
                <p style={styles.typeDesc}>Medical professional account</p>
              </div>
              <div
                onClick={() => setAccountType('staff')}
                style={{
                  ...styles.typeOption,
                  border: accountType === 'staff' ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: accountType === 'staff' ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                <p style={styles.typeTitle}>Receptionist/Staff</p>
                <p style={styles.typeDesc}>Limited access for front desk tasks</p>
              </div>
            </div>

            <h3 style={styles.sectionHeading}>Personal Information</h3>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>First Name <span style={{ color: '#ff4d4d' }}>*</span></label>
                <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="Enter first name" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>Last Name <span style={{ color: '#ff4d4d' }}>*</span></label>
                <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Enter last name" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>Mobile Phone Number <span style={{ color: '#ff4d4d' }}>*</span></label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} type="text" placeholder="(555) 123-4567" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>Birth Date <span style={{ color: '#ff4d4d' }}>*</span></label>
                <input name="dob" value={formData.dob} onChange={handleInputChange} type="date" style={styles.input} />
              </div>
            </div>

            <div style={{ ...styles.inputGroup, marginTop: '20px' }}>
              <label style={styles.fieldLabel}>Email Address <span style={{ color: '#ff4d4d' }}>*</span></label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="email@example.com" style={{ ...styles.input, width: '48.5%' }} />
            </div>

            {/* NEW: Branch and Specialty Selection */}
            <div style={{ ...styles.formGrid, marginTop: '20px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.fieldLabel}>Branch Location <span style={{ color: '#ff4d4d' }}>*</span></label>
                <select name="branch" value={formData.branch} onChange={handleInputChange} style={styles.input}>
                  <option value="Main Branch">Main Branch</option>
                  <option value="Gil Puyat, Pasay">Gil Puyat, Pasay</option>
                  <option value="Sta. Ana, Manila">Sta. Ana, Manila</option>
                  <option value="Angeles, Pampanga">Angeles, Pampanga</option>
                </select>
              </div>

              {accountType === 'dentist' && (
                <div style={styles.inputGroup}>
                  <label style={styles.fieldLabel}>Dental Specialty <span style={{ color: '#ff4d4d' }}>*</span></label>
                  <select name="specialty" value={formData.specialty} onChange={handleInputChange} style={styles.input}>
                    <option value="General Dentistry">General Dentistry</option>
                    <option value="Orthodontics">Orthodontics</option>
                    <option value="Restorative Treatment">Restorative Treatment</option>
                  </select>
                </div>
              )}
            </div>

            <div style={styles.formActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setFormData({ firstName: '', lastName: '', phone: '', dob: '', email: '', password: 'TempPassword123!', branch: 'Gil Puyat, Pasay', specialty: 'General Dentistry' })}>Cancel</button>
              <button type="submit" style={styles.createBtn}>Create Account</button>
            </div>
          </form>

          <div style={styles.guidelinesCard}>
            <h3 style={{ ...styles.sectionHeading, marginTop: 0 }}>Account Creation Guidelines</h3>
            <ul style={styles.guidelineList}>
              <li>All fields marked with <span style={{ color: '#ff4d4d' }}>*</span> are required</li>
              <li><strong>Dentist accounts:</strong> Full access to patient records, treatment plans, and medical documentation</li>
              <li><strong>Staff accounts:</strong> Limited access to appointment scheduling, patient registration, billing, and basic reports</li>
              <li>A temporary password will be sent to the provided email address</li>
              <li>New users must change their password on first login</li>
            </ul>
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
  formCard: { background: '#001166', padding: '30px', borderRadius: '15px', color: 'white', marginBottom: '30px' },
  fieldLabel: { fontSize: '13px', fontWeight: '600', marginBottom: '10px', display: 'block' },
  typeToggleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
  typeOption: { padding: '20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' },
  typeTitle: { margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' },
  typeDesc: { margin: 0, fontSize: '12px', opacity: 0.7 },
  sectionHeading: { fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px', marginTop: '30px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  // Adding specific select styling directly compatible with existing inputs
  input: { padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', appearance: 'auto' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '40px' },
  cancelBtn: { padding: '10px 30px', borderRadius: '8px', border: '1px solid white', background: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  createBtn: { padding: '10px 30px', borderRadius: '8px', border: 'none', background: 'white', color: '#001166', fontWeight: 'bold', cursor: 'pointer' },
  guidelinesCard: { background: '#001166', padding: '30px', borderRadius: '15px', color: 'white' },
  guidelineList: { margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8', opacity: 0.9 },

  // MODAL STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: '400px', textAlign: 'center', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  modalClose: { position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' },
  modalTitle: { fontSize: '20px', fontWeight: 'bold', margin: '20px 0 10px', color: '#001166' },
  modalText: { fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '25px' },
  modalBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#001166', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
};

export default AdminAccountCreation;