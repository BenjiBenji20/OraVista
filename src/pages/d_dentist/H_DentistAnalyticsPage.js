import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Search, Bell, MessageSquare, User,
  TrendingUp, ChevronRight, BrainCircuit,
  CalendarX, ActivitySquare, Stethoscope, Users
} from 'lucide-react';


function DentistAnalyticsPage() {
  // --- DYNAMIC STATE (Requirements 1 & 3) ---
  const [highRiskQueue, setHighRiskQueue] = useState([]);
  const [isQueueLoading, setIsQueueLoading] = useState(true);

  // --- HARDCODED DEMO DATA (Requirements 2, 4, 5) ---
  const [noShowPredictions] = useState([
    { time: 'Tomorrow, 9:00 AM', patient: 'Elena Rodriguez', probability: 85, reason: 'Missed last 2 appts, High travel distance', status: 'Reminder Sent' },
    { time: 'Tomorrow, 2:30 PM', patient: 'David Chen', probability: 72, reason: 'Historical Thursday afternoon drop-off', status: 'Pending Call' }
  ]);

  const [outcomePredictions] = useState([
    { procedure: 'Root Canal Therapy (Molar)', successRate: 94, factors: 'Patient age, lack of smoking history' },
    { procedure: 'Dental Implant (Anterior)', successRate: 82, factors: 'Mild bone loss detected, requires grafting' }
  ]);

  // --- DYNAMIC FETCH LOGIC ---
  const fetchRiskQueue = useCallback(async () => {
    setIsQueueLoading(true);
    try {
      // Get the logged-in dentist info from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const dentistId = user?.id || 93; // Fallback for testing
      const branch = user?.branch || "Main Branch";

      // GET request to our new dynamic endpoint
      const response = await fetch(
        `http://localhost:8080/api/dentist/dashboard/${dentistId}?branch=${encodeURIComponent(branch)}`
      );

      if (response.ok) {
        const data = await response.json();
        // The API returns { dentist_id: int, patients: [] }
        setHighRiskQueue(data.patients);
      }
    } catch (error) {
      console.error("Failed to fetch dentist dashboard analytics:", error);
    } finally {
      setIsQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskQueue();
  }, [fetchRiskQueue]);

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
            {/* ROW 1: Clinical & Patient Specific Group */}
            <div style={styles.sectionContainer}>
              <h2 style={styles.sectionHeading}>
                <Stethoscope size={24} color="#001166" />
                Clinical & Patient Specific Insights
              </h2>

              <div style={styles.rowGridClinical}>
                {/* 2. Treatment Outcome Predictions (Hardcoded for now) */}
                <div style={styles.insightsCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <ActivitySquare size={20} color="#60a5fa" />
                    <h3 style={styles.cardTitleWhite}>2. Treatment Outcome Predictions</h3>
                  </div>
                  {outcomePredictions.map((outcome, idx) => (
                    <div key={idx} style={styles.insightItem}>
                      <div style={styles.scoreCircleSmall}>{outcome.successRate}%</div>
                      <div>
                        <h4 style={styles.insightTitle}>{outcome.procedure}</h4>
                        <p style={styles.insightText}><strong>Key Factors:</strong> {outcome.factors}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 1 & 3. Predictive Risk Queue (DYNAMIC) */}
                <div style={styles.queueCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitleBlack}>1 & 3. Predictive Risk Queue</h3>
                    <span style={styles.viewAll} onClick={fetchRiskQueue}>
                      Refresh <ChevronRight size={14} />
                    </span>
                  </div>

                  <p style={styles.queueDesc}>High Risk Scores and severe disease progression forecasts in your branch.</p>

                  <div style={styles.queueList}>
                    {isQueueLoading ? (
                      <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>Loading Risk Queue...</p>
                    ) : highRiskQueue.length > 0 ? (
                      highRiskQueue.map((patient, index) => (
                        <div key={index} style={styles.queueItem}>
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
                            <button style={styles.reviewBtn}>Review Record</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>No high-risk patients detected in your branch.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Clinic Operations & Population Group */}
            <div style={styles.sectionContainer}>
              <h2 style={styles.sectionHeading}>
                <Users size={24} color="#001166" />
                Clinic Operations & Population
              </h2>

              <div style={styles.rowGridOperations}>
                {/* Requirement 4: Risk Stratification */}
                <div style={styles.whiteCard}>
                  <h3 style={styles.cardTitleBlack}>4. Clinic Risk Stratification</h3>
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

                {/* Requirement 5: Patients No Show Prediction */}
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
        </div>
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

  mainLayout: { display: 'flex', flexDirection: 'column', gap: '40px' },
  sectionContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionHeading: { fontSize: '20px', fontWeight: '800', color: '#001166', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #e0e7ff', paddingBottom: '10px' },
  rowGridClinical: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' },
  rowGridOperations: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },

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

  queueCard: { background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' },
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
};

export default DentistAnalyticsPage;