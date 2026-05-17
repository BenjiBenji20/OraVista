import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Search, Bell, MessageSquare, User, X,
  TrendingUp, ChevronRight, BrainCircuit,
  CalendarX, ActivitySquare, Stethoscope, Users
} from 'lucide-react';


function DentistAnalyticsPage() {
  // --- DYNAMIC STATE (Requirements 1, 2 & 3) ---
  const [highRiskQueue, setHighRiskQueue] = useState([]);
  const [isQueueLoading, setIsQueueLoading] = useState(true);
  const [treatmentOutcomes, setTreatmentOutcomes] = useState([]);
  const [isOutcomesLoading, setIsOutcomesLoading] = useState(true);
  const [currentRiskIndex, setCurrentRiskIndex] = useState(0);
  const [currentOutcomeIndex, setCurrentOutcomeIndex] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activePatient, setActivePatient] = useState(null);

  // --- HARDCODED DEMO DATA (Requirements 4, 5) ---
  const [noShowPredictions] = useState([
    { time: 'Tomorrow, 9:00 AM', patient: 'Elena Rodriguez', probability: 85, reason: 'Missed last 2 appts, High travel distance', status: 'Reminder Sent' },
    { time: 'Tomorrow, 2:30 PM', patient: 'David Chen', probability: 72, reason: 'Historical Thursday afternoon drop-off', status: 'Pending Call' }
  ]);

  // --- DYNAMIC FETCH LOGIC ---
  const fetchRiskQueue = useCallback(async () => {
    setIsQueueLoading(true);
    try {
      // Get the logged-in dentist info from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const dentistId = user?.dentistId || 93; // Fallback for testing

      // GET request to our new dynamic endpoint
      const response = await fetch(
        `http://localhost:8080/api/dentist/dashboard/predict-risk-queue/${dentistId}`
      );

      if (response.ok) {
        const data = await response.json();
        setHighRiskQueue(data.patients);
      }
    } catch (error) {
      console.error("Failed to fetch dentist dashboard analytics:", error);
    } finally {
      setIsQueueLoading(false);
    }
  }, []);

  const fetchTreatmentOutcomes = useCallback(async (patient) => {
    if (!patient) return;
    setIsOutcomesLoading(true);
    try {
      let pid = String(patient.patient_id || patient.id || "");
      let rawId = pid;
      if (pid.includes('-')) {
        const parts = pid.split('-');
        if (parts.length > 1) {
          rawId = parts[1].substring(2);
        }
      }

      // Fetch the analytics data just like Review Record
      const analyticsRes = await fetch(`http://localhost:8080/api/patient/get/${rawId}/analytics`);
      if (!analyticsRes.ok) throw new Error("Failed to fetch analytics");
      const analyticsData = await analyticsRes.json();

      // Send the POST request to generate the treatment outcome prediction
      const predictRes = await fetch("http://localhost:8080/api/dentist/dashboard/predict-treatment-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyticsData)
      });
      
      if (predictRes.ok) {
        const data = await predictRes.json();
        setTreatmentOutcomes([data]);
      }
    } catch (error) {
      console.error("Failed to generate treatment outcome prediction:", error);
    } finally {
      setIsOutcomesLoading(false);
    }
  }, []);

  // -- REVIEW RECORD FETCH --
  const handleReviewRecord = async (patient) => {
    setActivePatient(patient);
    setIsModalOpen(true);
    setModalLoading(true);
    setModalData(null);

    try {
      let pid = String(patient.patient_id || patient.id || "");
      let rawId = pid;

      if (pid.includes('-')) {
        const parts = pid.split('-');
        if (parts.length > 1) {
          rawId = parts[1].substring(2);
        }
      }

      const response = await fetch(`http://localhost:8080/api/patient/get/${rawId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setModalData(data);
      }
    } catch (error) {
      console.error("Error fetching patient analytics:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleReviewOutcome = async (outcome) => {
    setActivePatient({ name: `Prediction for Patient ${outcome.patient_id}`, issue: outcome.procedure_name });
    setIsModalOpen(true);
    setModalLoading(true);
    setModalData(null);

    try {
      const response = await fetch(`http://localhost:8080/api/dentist/dashboard/${outcome.patient_id}/predict-treatment-outcome/${outcome.id}`);
      if (response.ok) {
        const data = await response.json();
        setModalData(data);
      }
    } catch (error) {
      console.error("Error fetching outcome analytics:", error);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskQueue();
  }, [fetchRiskQueue]);

  useEffect(() => {
    if (highRiskQueue.length > 0 && highRiskQueue[currentRiskIndex]) {
      fetchTreatmentOutcomes(highRiskQueue[currentRiskIndex]);
    }
  }, [highRiskQueue, currentRiskIndex, fetchTreatmentOutcomes]);

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* ... HEADER CODE REMAINS SAME ... */}

        <div style={styles.content}>
          <div style={styles.topRow}>
            <div>
              <h1 style={styles.pageTitle}>Preventative & Predictive Analytics</h1>
              <p style={styles.pageSubtitle}>Machine Learning forecasts for clinical outcomes and clinic operations</p>
            </div>
            <div style={styles.aiBadge}>
              <BrainCircuit size={18} />
              OraVista ML Engine Active
            </div>
          </div>

          <div style={styles.mainLayout}>
            {/* LEFT COLUMN: Predictive Risk & Treatment Outcomes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* 1 & 3. Predictive Risk Queue (DYNAMIC) */}
              <div style={styles.queueCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitleBlack}>1 & 3. Predictive Risk Queue</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={styles.viewAll} onClick={fetchRiskQueue}>
                      Refresh <ChevronRight size={14} />
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        disabled={highRiskQueue.length === 0 || currentRiskIndex === 0}
                        onClick={() => setCurrentRiskIndex(i => i - 1)}
                        style={{...styles.navButton, opacity: (highRiskQueue.length === 0 || currentRiskIndex === 0) ? 0.5 : 1}}
                      >Back</button>
                      <button 
                        disabled={highRiskQueue.length === 0 || currentRiskIndex >= highRiskQueue.length - 1}
                        onClick={() => setCurrentRiskIndex(i => i + 1)}
                        style={{...styles.navButton, opacity: (highRiskQueue.length === 0 || currentRiskIndex >= highRiskQueue.length - 1) ? 0.5 : 1}}
                      >Next</button>
                    </div>
                  </div>
                </div>

                <p style={styles.queueDesc}>High Risk Scores and severe disease progression forecasts in your branch.</p>

                <div style={styles.queueList}>
                  {isQueueLoading ? (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>Loading Risk Queue...</p>
                  ) : highRiskQueue.length > 0 ? (
                    (() => {
                      const patient = highRiskQueue[currentRiskIndex];
                      return (
                        <div style={styles.queueItem}>
                          <div style={styles.queueTop}>
                            <div style={styles.queueInfo}>
                              <div style={styles.queueAvatar}><User size={16} color="#001166" /></div>
                              <div>
                                <p style={styles.queueName}>{patient.name} <span style={styles.queueId}>({patient.patient_id})</span></p>
                                <p style={styles.queueIssue}>Current Path: <strong>{patient.issue}</strong></p>
                              </div>
                            </div>
                            <div style={styles.scoreCircle}>
                              {patient.score}%
                            </div>
                          </div>

                          <div style={styles.queueMiddle}>
                            <TrendingUp size={16} color="#ef4444" style={{ marginTop: '2px' }} />
                            <div>
                              <span style={styles.actionLabel}>Disease Progression Forecast:</span>
                              <span style={styles.progressionText}>{patient.progression}</span>
                            </div>
                          </div>

                          <div style={styles.queueBottom}>
                            <div style={styles.aiActionBox}>
                              <BrainCircuit size={14} color="#4f46e5" style={{ marginTop: '2px' }} />
                              <div>
                                <span style={styles.actionLabel}>Preventive Action:</span>
                                <span style={styles.actionText}>{patient.action}</span>
                              </div>
                            </div>
                            <button
                              style={styles.reviewBtn}
                              onClick={() => handleReviewRecord(patient)}
                            >
                              Review Record
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>No high-risk patients detected in your branch.</p>
                  )}
                </div>
              </div>

              {/* 2. Treatment Outcome Predictions (DYNAMIC) */}
              <div 
                style={{ ...styles.insightsCard, display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}
                onClick={() => {
                  if (treatmentOutcomes && treatmentOutcomes.length > 0) {
                    handleReviewOutcome(treatmentOutcomes[0]);
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ActivitySquare size={20} color="#60a5fa" />
                    <h3 style={styles.cardTitleWhite}>2. Treatment Outcome Predictions</h3>
                  </div>
                </div>
                
                {isOutcomesLoading ? (
                  <p style={{ color: 'white', textAlign: 'center', margin: 'auto' }}>Loading predictions...</p>
                ) : treatmentOutcomes && treatmentOutcomes.length > 0 ? (
                  (() => {
                    const outcome = treatmentOutcomes[0];
                    return (
                      <div style={{ ...styles.insightItem, flexGrow: 1, margin: 0, padding: 0, background: 'transparent' }}>
                        <div style={styles.scoreCircleSmall}>{outcome.success_probability}%</div>
                        <div>
                          <h4 style={styles.insightTitle}>{outcome.procedure_name}</h4>
                          <p style={styles.insightText}><strong>Key Factors:</strong> {outcome.key_factors}</p>
                          <p style={{ ...styles.insightText, fontSize: '11px', marginTop: '5px', color: '#93c5fd' }}>
                          </p>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p style={{ color: 'white', textAlign: 'center', margin: 'auto' }}>No outcomes available.</p>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Clinic Operations & Population Group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* 4. Clinic Risk Stratification */}
              <div style={styles.whiteCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Users size={20} color="#001166" />
                  <h3 style={styles.cardTitleBlack}>4. Clinic Risk Stratification</h3>
                </div>
                <div style={styles.barChartContainer}>
                  <div style={styles.barRow}>
                    <span style={styles.barLabel}>Low Risk (70%) - Routine Care</span>
                    <div style={styles.barTrack}><div style={{ ...styles.barFill, width: '70%', background: '#10b981' }}></div></div>
                  </div>
                  <div style={styles.barRow}>
                    <span style={styles.barLabel}>Medium Risk (20%) - Monitor</span>
                    <div style={styles.barTrack}><div style={{ ...styles.barFill, width: '20%', background: '#f59e0b' }}></div></div>
                  </div>
                  <div style={styles.barRow}>
                    <span style={styles.barLabel}>High Risk (10%) - Urgent Intervention</span>
                    <div style={styles.barTrack}><div style={{ ...styles.barFill, width: '10%', background: '#ef4444' }}></div></div>
                  </div>
                </div>
              </div>

              {/* 5. No-Show Flight Risk */}
              <div style={{ ...styles.whiteCard, borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <CalendarX size={20} color="#f59e0b" />
                  <h3 style={styles.cardTitleBlack}>5. No-Show Flight Risk</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {noShowPredictions.map((appt, idx) => (
                    <div key={idx} style={styles.noShowItem}>
                      <div style={{ flex: 1 }}>
                        <p style={styles.noShowName}>{appt.patient}</p>
                        <p style={styles.noShowTime}>{appt.time}</p>
                        <p style={styles.noShowReason}><strong>AI Flag:</strong> {appt.reason}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <span style={styles.probBadge}>{appt.probability}% Risk</span>
                        <button style={styles.reminderBtn}>{appt.status === 'Reminder Sent' ? '✓ Reminded' : 'Send Automated SMS'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              {/* Header */}
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={{ margin: 0, color: "#001166" }}>{activePatient?.name}</h2>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    Current Path: <strong>{activePatient?.issue}</strong>
                  </p>
                </div>
                <X
                  size={24}
                  style={{ cursor: "pointer", color: "#666" }}
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              {/* Body */}
              <div style={styles.modalBody}>
                {modalLoading ? (
                  <p style={{ textAlign: "center", padding: "40px" }}>Loading Clinical Records...</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#001166", color: "white" }}>
                        <th style={{ padding: "12px 15px" }}>Indicator</th>
                        <th style={{ padding: "12px 15px" }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData && Object.keys(modalData).length > 0 ? (
                        Object.entries(modalData).map(([key, value], index) => {
                          if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return null;
                          const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <tr key={key} style={{ borderBottom: index < Object.keys(modalData).length - 1 ? "1px solid #eee" : "none" }}>
                              <td style={{ padding: "12px 15px", fontWeight: "600", color: "#333" }}>{label}</td>
                              <td style={{ padding: "12px 15px", color: "#666" }}>{String(value)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="2" style={{ padding: "15px", textAlign: "center", color: "#666" }}>
                            Data Not Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: "'Poppins', sans-serif" },
  header: { height: '80px', background: '#001166', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 10 },
  searchBox: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', width: '300px' },
  searchInput: { border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%', color: 'white' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '25px' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' },
  profileText: { textAlign: 'right' },
  userName: { margin: 0, fontWeight: 'bold', fontSize: '14px', color: 'white' },
  userRole: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
  avatar: { width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  content: { padding: '40px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '800', color: '#001166', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#666' },
  aiBadge: { backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '10px 20px', borderRadius: '30px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #c7d2fe' },

  mainLayout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' },
  sectionContainer: { display: 'flex', flexDirection: 'column', gap: '20px', margin: "20px" },
  sectionHeading: { fontSize: '20px', fontWeight: '800', color: '#001166', marginTop: "20px", display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #e0e7ff', paddingBottom: '10px' },
  rowGridClinical: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' },
  rowGridOperations: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  navButton: { padding: '5px 12px', borderRadius: '5px', border: '1px solid #e0e7ff', background: 'white', color: '#001166', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },

  whiteCard: { background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' },
  cardTitleBlack: { fontSize: '18px', fontWeight: '700', color: '#001166', margin: 0 },

  barChartContainer: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  barRow: { display: 'flex', flexDirection: 'column', gap: '6px' },
  barLabel: { fontSize: '13px', fontWeight: '600', color: '#444' },
  barTrack: { width: '100%', height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '5px' },

  insightsCard: { background: '#001166', borderRadius: '20px', padding: '25px', color: 'white', boxShadow: '0 10px 30px rgba(0,17,102,0.1)', height: '100%' },
  cardTitleWhite: { fontSize: '18px', fontWeight: '700', margin: 0 },
  insightItem: { display: 'flex', gap: '15px', marginBottom: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', alignItems: 'center' },
  scoreCircleSmall: { width: '45px', height: '45px', borderRadius: '50%', border: '3px solid #60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#60a5fa', flexShrink: 0 },
  insightTitle: { margin: '0 0 5px 0', fontSize: '15px', fontWeight: '700' },
  insightText: { margin: 0, fontSize: '12px', opacity: 0.8, lineHeight: '1.4' },

  noShowItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', border: '1px solid #f0f0f0', borderRadius: '12px', backgroundColor: '#fafbfc' },
  noShowName: { fontSize: '15px', fontWeight: '700', color: '#001166', margin: '0 0 5px 0' },
  noShowTime: { fontSize: '13px', color: '#444', margin: '0 0 8px 0', fontWeight: '600' },
  noShowReason: { fontSize: '12px', color: '#dc2626', margin: 0 },
  probBadge: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #fecaca' },
  reminderBtn: { backgroundColor: '#001166', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },

  queueCard: { background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%'},
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  viewAll: { fontSize: '13px', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  queueDesc: { fontSize: '13px', color: '#666', marginBottom: '25px' },

  queueList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  queueItem: { border: '1px solid #eee', borderRadius: '15px', padding: '20px', backgroundColor: '#fafbfc' },
  queueTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  queueInfo: { display: 'flex', gap: '15px' },
  queueAvatar: { width: '40px', height: '40px', backgroundColor: '#e0e7ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  queueName: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#001166' },
  queueId: { fontSize: '12px', color: '#888', fontWeight: '500' },
  queueIssue: { margin: 0, fontSize: '13px', color: '#dc2626' },
  scoreCircle: { width: '45px', height: '45px', borderRadius: '50%', border: '3px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#dc2626' },

  queueMiddle: { display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', marginBottom: '15px' },
  progressionText: { display: 'block', fontSize: '13px', color: '#dc2626', fontWeight: '600' },

  queueBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' },
  aiActionBox: { display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 },
  actionLabel: { display: 'block', fontSize: '11px', color: '#4f46e5', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' },
  actionText: { display: 'block', fontSize: '13px', color: '#333', fontWeight: '500' },
  reviewBtn: { backgroundColor: '#001166', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    width: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  modalBody: {
    marginTop: "10px",
  },
};

export default DentistAnalyticsPage;