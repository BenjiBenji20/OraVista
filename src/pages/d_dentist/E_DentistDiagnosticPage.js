import React, { useState, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Bell, MessageSquare, User, ZoomIn, RotateCw, Copy, FileText, UploadCloud, Target, CheckCircle, X } from 'lucide-react';

function DentistDiagnostics() {
  // State Management
  const [imageUploaded, setImageUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [findings, setFindings] = useState([]);

  // States for saving the diagnosis to the database
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUploaded(true);

      setAnalysisComplete(false);
      setFindings([]);
      setClinicalNotes("");
    }
  };

  const runAIAnalysis = async () => {
    if (!selectedFile) {
      alert("Please upload a real image first.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://127.0.0.1:8000/analyze-xray', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setFindings(data.findings);
        setAnalysisComplete(true);
      } else {
        console.error("Server Error:", data);
      }
    } catch (error) {
      console.error("AI Analysis Failed:", error);
      alert("Could not connect to the AI Engine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleValidate = (id, action) => {
    setFindings(findings.map(f => f.id === id ? { ...f, status: action } : f));
  };

  const handleSaveDiagnosis = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('https://oravista-server-temporary-754963692967.asia-southeast1.run.app/api/save-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: 1,
          clinical_notes: clinicalNotes,
          ai_findings: findings
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert("Success! The AI results and your notes have been saved to the patient's record.");
      } else {
        alert("Error saving to database.");
      }
    } catch (error) {
      console.error("Save Failed:", error);
      alert("Could not connect to the Node.js server. Is it running on port 5000?");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <input type="text" placeholder="Search diagnostics..." style={styles.searchInput} />
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

        {/* CONTENT */}
        <div style={styles.content}>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>Diagnostics</h1>
            <p style={styles.pageSubtitle}>AI-Assisted Imaging & Clinical Findings</p>
          </div>

          <div style={styles.infoBar}>
            <div style={styles.infoCol}>
              <p style={styles.infoLabel}>Patient Name</p>
              <p style={styles.infoVal}>John Anderson</p>
            </div>
            <div style={styles.infoCol}>
              <p style={styles.infoLabel}>Patient ID</p>
              <p style={styles.infoVal}>PT-1001</p>
            </div>
            <div style={styles.infoCol}>
              <p style={styles.infoLabel}>Case Type</p>
              <p style={styles.infoVal}>Panoramic X-Ray</p>
            </div>
            <div style={{ ...styles.infoCol, border: 'none' }}>
              <p style={styles.infoLabel}>Scan Date</p>
              <p style={styles.infoVal}>Feb 15, 2026</p>
            </div>
          </div>

          <div style={styles.mainGrid}>

            {/* LEFT COLUMN: Viewer + AI Insights */}
            <div style={styles.leftPanel}>
              <div style={styles.viewerCard}>
                <div style={styles.viewerHeader}>
                  <h3 style={styles.sectionTitle}>Image Analysis</h3>
                  <div style={styles.viewerActions}>
                    <button style={styles.vBtn}><ZoomIn size={14} /> Zoom</button>
                    <button style={styles.vBtn}><RotateCw size={14} /> Rotate</button>
                    <button style={styles.vBtn}><Copy size={14} /> Compare</button>
                  </div>
                </div>

                <div style={styles.xrayImageArea}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  {!imageUploaded ? (
                    <div style={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
                      <UploadCloud size={48} color="rgba(255,255,255,0.4)" style={{ marginBottom: '15px' }} />
                      <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Upload X-Ray or Intraoral Scan</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '5px' }}>Click to browse (JPG, PNG)</p>
                    </div>
                  ) : (
                    <div style={styles.simulatedXray}>
                      {selectedFile ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Patient X-Ray"
                          style={{ width: '100%', height: '100%', objectFit: 'fill', borderRadius: '10px' }}
                        />
                      ) : (
                        <>
                          <FileText size={64} color="rgba(255,255,255,0.1)" />
                          <p style={styles.placeholderText}>Simulated Panoramic X-Ray View</p>
                        </>
                      )}

                      {analysisComplete && showAI && findings.map(finding => (
                        <div
                          key={finding.id}
                          style={{
                            ...styles.boundingBox,
                            top: finding.coordinates.top,
                            left: finding.coordinates.left,
                            width: finding.coordinates.width,
                            height: finding.coordinates.height,
                            borderColor: finding.status === 'rejected' ? 'transparent' : (finding.status === 'verified' ? '#10b981' : '#ef4444')
                          }}
                        >
                          {(finding.status === 'pending' || finding.status === 'verified') && (
                            <span style={{
                              ...styles.boxLabel,
                              backgroundColor: finding.status === 'verified' ? '#10b981' : '#ef4444'
                            }}>
                              {finding.confidence}%
                            </span>
                          )}
                        </div>
                      ))}

                      {isAnalyzing && (
                        <div style={styles.scannerLine}></div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* MOVED: AI Insights Card is now below the viewer */}
              <div style={styles.insightsCard}>
                <h3 style={styles.sectionTitle}>AI Insight Analysis</h3>

                {!imageUploaded ? (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '20px' }}>Upload an image to begin the CNN analysis.</p>
                ) : !analysisComplete && !isAnalyzing ? (
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ color: 'white', fontSize: '14px', marginBottom: '15px' }}>Image ingested successfully. Ready for pathology detection.</p>
                    <button style={styles.analyzeBtn} onClick={runAIAnalysis}>
                      <Target size={16} /> Run Diagnostics
                    </button>
                  </div>
                ) : isAnalyzing ? (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>Analyzing visual data...</p>
                  </div>
                ) : (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{findings.length} findings detected</span>
                      <button
                        style={styles.toggleBtn}
                        onClick={() => setShowAI(!showAI)}
                      >
                        {showAI ? 'Hide AI Overlays' : 'Show AI Overlays'}
                      </button>
                    </div>

                    {/* NEW: Grid Layout for findings */}
                    <div style={styles.findingsGrid}>
                      {findings.map((insight) => (
                        <div key={insight.id} style={{
                          ...styles.insightBox,
                          opacity: insight.status === 'rejected' ? 0.4 : 1,
                          borderLeft: insight.status === 'verified' ? '3px solid #10b981' : (insight.status === 'rejected' ? '3px solid #6b7280' : 'none')
                        }}>
                          {/* UPDATED: Terminology change via JavaScript replace */}
                          <p style={styles.insightText}>
                            {insight.title ? insight.title.replace(/YOLO Detection/gi, "AI Finding") : "AI Finding"}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              ...styles.confBadge,
                              backgroundColor: insight.status === 'verified' ? '#10b981' : (insight.status === 'rejected' ? '#6b7280' : '#f59e0b')
                            }}>{insight.confidence}% Confidence</span>

                            {insight.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={styles.actionBtnCheck} onClick={() => handleValidate(insight.id, 'verified')}><CheckCircle size={14} color="#10b981" /></button>
                                <button style={styles.actionBtnCross} onClick={() => handleValidate(insight.id, 'rejected')}><X size={14} color="#ef4444" /></button>
                              </div>
                            )}
                            {insight.status === 'verified' && <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>Verified</span>}
                            {insight.status === 'rejected' && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>Rejected</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Clinical Notes only */}
            <div style={styles.sidePanel}>
              <div style={styles.notesCard}>
                <h3 style={styles.sectionTitle}>Clinical Notes</h3>
                <textarea
                  placeholder="Enter final diagnosis and recommendations here. AI findings are supportive only."
                  style={styles.textarea}
                  disabled={!analysisComplete}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                />
                <button
                  style={{
                    ...styles.saveBtn,
                    opacity: analysisComplete && !isSaving ? 1 : 0.5,
                    cursor: analysisComplete && !isSaving ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!analysisComplete || isSaving}
                  onClick={handleSaveDiagnosis}
                >
                  {isSaving ? "Saving..." : "Save Final Diagnosis"}
                </button>
              </div>
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

  content: { padding: '40px', backgroundColor: '#F4F7FE' },
  titleSection: { marginBottom: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#001166', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#666', marginTop: '5px' },

  infoBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#001166', borderRadius: '15px', padding: '20px', marginBottom: '25px', color: 'white' },
  infoCol: { borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 20px' },
  infoLabel: { fontSize: '11px', opacity: 0.6, marginBottom: '5px' },
  infoVal: { fontSize: '15px', fontWeight: 'bold' },

  mainGrid: { display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '25px' },

  // NEW: Structural containers
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '25px' },
  sidePanel: { display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' },

  viewerCard: { background: '#001166', borderRadius: '15px', padding: '25px', color: 'white' },
  viewerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', margin: 0 },
  viewerActions: { display: 'flex', gap: '10px' },
  vBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },

  xrayImageArea: { height: '500px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  uploadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', width: '90%', height: '90%', cursor: 'pointer', transition: 'background 0.2s' },
  simulatedXray: { width: '80%', height: '80%', backgroundColor: '#000833', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 0 50px rgba(0,0,0,0.5)' },
  placeholderText: { fontSize: '14px', opacity: 0.5, marginTop: '10px', color: 'white' },

  boundingBox: { position: 'absolute', border: '2px solid', zIndex: 5, borderRadius: '4px' },
  boxLabel: { position: 'absolute', top: '-22px', left: '-2px', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' },
  scannerLine: { position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', backgroundColor: '#10b981', boxShadow: '0 0 15px #10b981', animation: 'scan 2s linear infinite' },

  insightsCard: { background: '#001166', borderRadius: '15px', padding: '25px', color: 'white' },

  // NEW: Grid layout so multiple findings flow horizontally
  findingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' },

  insightBox: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px', transition: 'all 0.3s' },
  insightText: { fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.4' },
  confBadge: { fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' },

  analyzeBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'center' },
  toggleBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' },
  actionBtnCheck: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex' },
  actionBtnCross: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex' },

  // UPDATED: Clinical Notes now stretches to fill the vertical space
  notesCard: { background: '#001166', borderRadius: '15px', padding: '25px', color: 'white', display: 'flex', flexDirection: 'column', flex: 1 },
  textarea: { width: '100%', flex: 1, minHeight: '300px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', padding: '15px', color: 'white', marginTop: '15px', outline: 'none', resize: 'none' },
  saveBtn: { width: '100%', marginTop: '15px', padding: '12px', background: 'white', color: '#001166', border: 'none', borderRadius: '10px', fontWeight: 'bold', transition: 'opacity 0.2s' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes scan { 
    0% { top: 0; opacity: 0; } 
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; } 
  }
`;
document.head.appendChild(styleSheet);

export default DentistDiagnostics;