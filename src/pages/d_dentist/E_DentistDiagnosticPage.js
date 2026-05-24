import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Search, Bell, MessageSquare, User, ZoomIn, RotateCw, UploadCloud, CheckCircle, X, Activity } from 'lucide-react';

// Global API Base Endpoints
const NODE_API_BASE = "http://localhost:5000";
const FASTAPI_API_BASE = "https://cautious-funicular-g4x9r6gg757399x9-8080.app.github.dev";

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

  // Dental Check Up Feature State
  const [isCheckUpModalOpen, setIsCheckUpModalOpen] = useState(false);
  const [checkUpData, setCheckUpData] = useState({
    age: "", sex: "", blood_type: "", allergies: "", occupation: "",
    sugar_intake_score: 0, brushing_frequency: 0, flossing_frequency: 0,
    smoking: false, alcohol_use: false, previous_cavities: 0, previous_extractions: 0,
    family_history_dental_disease: false, last_dental_visit_months_ago: "", medical_history_notes: ""
  });
  const [isSubmittingCheckUp, setIsSubmittingCheckUp] = useState(false);
  const [checkUpResponseData, setCheckUpResponseData] = useState(null);

  const fileInputRef = useRef(null);

  // Patient Search State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patient_id') || searchParams.get('id');
  const isUploadDisabled = !selectedPatient && !patientIdParam;

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-fetch patient if param is present
  useEffect(() => {
    if (patientIdParam) {
      const fetchPatient = async () => {
        try {
          const cleanId = patientIdParam.toString().replace('PT-100', '').trim();
          const response = await fetch(`${NODE_API_BASE}/api/patients`);
          if (response.ok) {
            const allPatients = await response.json();
            const patient = allPatients.find(p => 
              p.id.toString() === cleanId || 
              p.id.toString() === patientIdParam.toString()
            );
            if (patient) {
              setSelectedPatient(patient);
              setSearchQuery(`${patient.first_name} ${patient.last_name}`);
            }
          }
        } catch (err) {
          console.error("Error fetching patient by param:", err);
        }
      };
      fetchPatient();
    }
  }, [patientIdParam]);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setIsSearchingPatients(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${NODE_API_BASE}/api/patients/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Error searching patients:", err);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchQuery(`${patient.first_name} ${patient.last_name}`);
    setShowDropdown(false);
  };

  const handleOpenCheckUp = () => {
    if (!selectedPatient) return;
    setCheckUpData({
      age: selectedPatient.age || "",
      sex: selectedPatient.sex || "",
      blood_type: selectedPatient.blood_type || "",
      allergies: selectedPatient.allergies || "",
      occupation: selectedPatient.occupation || "",
      sugar_intake_score: 0,
      brushing_frequency: 0,
      flossing_frequency: 0,
      smoking: false,
      alcohol_use: false,
      previous_cavities: 0,
      previous_extractions: 0,
      family_history_dental_disease: false,
      last_dental_visit_months_ago: "",
      medical_history_notes: ""
    });
    setCheckUpResponseData(null);
    setIsCheckUpModalOpen(true);
  };

  const handleCheckUpSubmit = async () => {
    if (!selectedPatient) return;
    setIsSubmittingCheckUp(true);
    try {
      const payload = {
        patient_id: parseInt(selectedPatient.id),
        age: checkUpData.age ? parseInt(checkUpData.age) : null,
        sex: checkUpData.sex || null,
        blood_type: checkUpData.blood_type || null,
        allergies: checkUpData.allergies || null,
        occupation: checkUpData.occupation || null,
        sugar_intake_score: parseInt(checkUpData.sugar_intake_score) || 0,
        brushing_frequency: parseInt(checkUpData.brushing_frequency) || 0,
        flossing_frequency: parseInt(checkUpData.flossing_frequency) || 0,
        smoking: Boolean(checkUpData.smoking),
        alcohol_use: Boolean(checkUpData.alcohol_use),
        previous_cavities: parseInt(checkUpData.previous_cavities) || 0,
        previous_extractions: parseInt(checkUpData.previous_extractions) || 0,
        family_history_dental_disease: Boolean(checkUpData.family_history_dental_disease),
        last_dental_visit_months_ago: checkUpData.last_dental_visit_months_ago ? parseInt(checkUpData.last_dental_visit_months_ago) : null,
        medical_history_notes: checkUpData.medical_history_notes || ""
      };

      const res = await fetch(`${FASTAPI_API_BASE}/api/dentist/check-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const responseData = await res.json();
        setCheckUpResponseData(responseData);
      } else {
        alert("Failed to submit check-up data.");
      }
    } catch (err) {
      console.error("Check-up submit error:", err);
      alert("Server error during check-up submission.");
    } finally {
      setIsSubmittingCheckUp(false);
    }
  };

  // Drag and Drop & Upload File Handlers
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadFileAndAnalyze = async (file) => {
    const activePatientId = selectedPatient ? selectedPatient.id : (patientIdParam ? patientIdParam.toString().replace('PT-100', '').trim() : null);
    if (!activePatientId) {
      alert("No patient selected or patient ID parameter found. Cannot upload.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    const formData = new FormData();
    formData.append('patient_id', activePatientId);
    formData.append('file', file);

    let responseData = null;
    const delayPromise = new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const uploadPromise = fetch(`${FASTAPI_API_BASE}/api/diagnostic-imaging/upload`, {
        method: 'POST',
        body: formData
      }).then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      });

      const [result] = await Promise.all([
        uploadPromise.catch(err => {
          console.warn("FastAPI server offline or error. Using mock response.", err);
          return null;
        }),
        delayPromise
      ]);

      responseData = result;
      console.log(responseData);
    } catch (error) {
      console.error("Upload error:", error);
    }

    if (!responseData) {
      const localUrl = URL.createObjectURL(file);
      responseData = {
        diagnostic_id: Math.floor(Math.random() * 1000) + 1,
        patient_id: activePatientId,
        file_path: localUrl,
        clinical_notes: "AI Recommended Advisory: Indication of localized caries on the lower left premolars and moderate horizontal bone loss on the posterior region. Clinical validation suggested.",
        predictions: [
          {
            class_id: 1,
            name: "Caries (Cavities)",
            confidence: 0.94,
            box: {
              x_min: 0.15,
              y_min: 0.25,
              width: 0.12,
              height: 0.10
            }
          },
          {
            class_id: 2,
            name: "Bone Loss (Periodontitis)",
            confidence: 0.82,
            box: {
              x_min: 0.45,
              y_min: 0.55,
              width: 0.18,
              height: 0.15
            }
          }
        ],
        scan_date: new Date().toISOString()
      };
    }

    setDiagnosticData(responseData);
    setAnnotations(responseData.predictions || []);

    const compatFindings = (responseData.predictions || []).map((pred, index) => ({
      id: index + 1,
      title: pred.name,
      confidence: Math.round(pred.confidence * 100),
      status: 'pending',
      class_id: pred.class_id,
      coordinates: pred.box ? {
        top: `${pred.box.y_min * 100}%`,
        left: `${pred.box.x_min * 100}%`,
        width: `${pred.box.width * 100}%`,
        height: `${pred.box.height * 100}%`
      } : null
    }));

    setFindings(compatFindings);
    setAnalysisComplete(true);
    setIsAnalyzing(false);
  };

  const processFile = (file) => {
    if (!file) return;
    if (isUploadDisabled) {
      alert("Please select a patient or make sure a patient ID is provided before uploading.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a .jpg, .jpeg, or .png file.");
      return;
    }

    setSelectedFile(file);
    setImageUploaded(true);
    setClinicalNotes("");
    
    uploadFileAndAnalyze(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // Zoom & Rotation state for Insight Image
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Bounding Box Drawing States
  const [annotations, setAnnotations] = useState([]);
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentDraw, setCurrentDraw] = useState(null);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [annotationText, setAnnotationText] = useState("");
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!analysisComplete || isAnalyzing || pendingAnnotation) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pctX = x / rect.width;
    const pctY = y / rect.height;
    
    setIsDrawingBox(true);
    setDrawStart({ x: pctX, y: pctY });
    setCurrentDraw({ x: pctX, y: pctY, w: 0, h: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawingBox) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pctX = x / rect.width;
    const pctY = y / rect.height;
    
    const x_min = Math.min(drawStart.x, pctX);
    const y_min = Math.min(drawStart.y, pctY);
    const width = Math.abs(drawStart.x - pctX);
    const height = Math.abs(drawStart.y - pctY);
    
    setCurrentDraw({
      x: x_min,
      y: y_min,
      w: width,
      h: height
    });
  };

  const handleMouseUp = () => {
    if (!isDrawingBox) return;
    setIsDrawingBox(false);
    
    if (currentDraw && currentDraw.w > 0.01 && currentDraw.h > 0.01) {
      setPendingAnnotation({
        x_min: currentDraw.x,
        y_min: currentDraw.y,
        width: currentDraw.w,
        height: currentDraw.h
      });
      setAnnotationText("");
    } else {
      setCurrentDraw(null);
    }
  };

  const handleSaveAnnotation = () => {
    if (!annotationText.trim()) {
      handleCancelAnnotation();
      return;
    }
    
    const doctorClassStart = 5;
    const existingClassIds = annotations.map(ann => ann.class_id);
    const maxClassId = existingClassIds.length > 0 ? Math.max(...existingClassIds) : 0;
    const newClassId = Math.max(doctorClassStart, maxClassId + 1);

    const newAnnotation = {
      class_id: newClassId,
      name: annotationText.trim(),
      confidence: 0.99,
      box: {
        x_min: pendingAnnotation.x_min,
        y_min: pendingAnnotation.y_min,
        width: pendingAnnotation.width,
        height: pendingAnnotation.height
      }
    };

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);

    const newFindingId = findings.length > 0 ? Math.max(...findings.map(f => f.id)) + 1 : 1;
    const newFinding = {
      id: newFindingId,
      title: newAnnotation.name,
      confidence: 99,
      status: 'verified',
      isDoctorCreated: true,
      class_id: newClassId,
      coordinates: {
        top: `${newAnnotation.box.y_min * 100}%`,
        left: `${newAnnotation.box.x_min * 100}%`,
        width: `${newAnnotation.box.width * 100}%`,
        height: `${newAnnotation.box.height * 100}%`
      }
    };
    setFindings([...findings, newFinding]);

    setPendingAnnotation(null);
    setCurrentDraw(null);
    setAnnotationText("");
  };

  const handleCancelAnnotation = () => {
    setPendingAnnotation(null);
    setCurrentDraw(null);
    setAnnotationText("");
  };

  const handleValidate = (id, action) => {
    const targetFinding = findings.find(f => f.id === id);
    if (!targetFinding) return;

    if (targetFinding.isDoctorCreated && action === 'rejected') {
      // Completely remove it from findings and annotations
      setFindings(findings.filter(f => f.id !== id));
      setAnnotations(annotations.filter(ann => ann.class_id !== targetFinding.class_id));
      return;
    }

    setFindings(findings.map(f => f.id === id ? { ...f, status: action } : f));

    if (action === 'rejected') {
      setAnnotations(annotations.filter(ann => ann.class_id !== targetFinding.class_id));
    } else if (action === 'verified') {
      const isAlreadyIn = annotations.some(ann => ann.class_id === targetFinding.class_id);
      if (!isAlreadyIn) {
        const origPred = diagnosticData?.predictions?.find(p => p.class_id === targetFinding.class_id);
        if (origPred) {
          setAnnotations([...annotations, origPred]);
        }
      }
    }
  };

  const handleSaveDiagnosis = async () => {
    if (!diagnosticData || !diagnosticData.diagnostic_id) {
      alert("No active diagnosis record to update. Please upload an image first.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        clinical_notes: clinicalNotes,
        human_verified_findings: {
          predictions: diagnosticData.predictions || [],
          annotations: annotations,
          human_verified: true
        }
      };

      const response = await fetch(`${FASTAPI_API_BASE}/api/diagnostic-imaging/${diagnosticData.diagnostic_id}/annotate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Success! The diagnostic record has been updated with annotations and clinical notes.");
      } else {
        alert(`Error: ${data.message || "Failed to update annotations"}`);
      }
    } catch (error) {
      console.error("Save Failed:", error);
      alert("Could not connect to the FastAPI server. Is it running on port 8000?");
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

          {/* Patient Search Bar UI */}
          <div style={styles.searchBarContainer} ref={dropdownRef}>
            <div style={styles.patientSearchBox}>
              <Search size={18} color="#001166" style={{ opacity: 0.6 }} />
              <input
                type="text"
                placeholder="Search patient by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (searchQuery.trim() !== "") setShowDropdown(true); }}
                style={styles.patientSearchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  style={styles.clearSearchBtn}
                >
                  <X size={16} color="#001166" />
                </button>
              )}
            </div>

            {showDropdown && (
              <div style={styles.patientDropdown}>
                {isSearchingPatients ? (
                  <div style={styles.dropdownMessage}>Searching patients...</div>
                ) : searchResults.length === 0 ? (
                  <div style={styles.dropdownMessage}>No patient found.</div>
                ) : (
                  searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      onMouseEnter={() => setHoveredItemId(patient.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      style={{
                        ...styles.dropdownItem,
                        backgroundColor: hoveredItemId === patient.id ? 'rgba(0, 17, 102, 0.05)' : 'white'
                      }}
                    >
                      <div style={styles.patientAvatar}>
                        {patient.profile_picture ? (
                          <img
                            src={`http://localhost:5000/${patient.profile_picture}`}
                            alt=""
                            style={styles.avatarImg}
                          />
                        ) : (
                          <User size={16} color="#001166" />
                        )}
                      </div>
                      <div style={styles.patientInfo}>
                        <p style={styles.patientNameText}>
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p style={styles.patientEmailText}>{patient.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{
            ...styles.infoBar,
            gridTemplateColumns: selectedPatient ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)',
            alignItems: 'center'
          }}>
            <div style={styles.infoCol}>
              <p style={styles.infoLabel}>Patient Name</p>
              <p style={styles.infoVal}>
                {selectedPatient 
                  ? `${selectedPatient.first_name} ${selectedPatient.last_name}` 
                  : "N/A"}
              </p>
            </div>
            <div style={styles.infoCol}>
              <p style={styles.infoLabel}>Patient ID</p>
              <p style={styles.infoVal}>
                {selectedPatient ? `PT-${selectedPatient.id}` : "N/A"}
              </p>
            </div>
            <div style={styles.infoCol}>
              <p style={styles.infoLabel}>Case Type</p>
              <p style={styles.infoVal}>Panoramic X-Ray</p>
            </div>
            <div style={{
              ...styles.infoCol,
              border: selectedPatient ? '1px solid rgba(255,255,255,0.1)' : 'none',
              borderLeft: 'none',
              borderTop: 'none',
              borderBottom: 'none'
            }}>
              <p style={styles.infoLabel}>Scan Date</p>
              <p style={styles.infoVal}>Feb 15, 2026</p>
            </div>
            {selectedPatient && (
              <div style={{
                ...styles.infoCol,
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <p style={styles.infoLabel}>Action</p>
                <button
                  onClick={handleOpenCheckUp}
                  style={styles.checkUpBtn}
                >
                  <Activity size={16} /> Dental Check Up
                </button>
              </div>
            )}
          </div>

          <div style={styles.mainGrid}>

            {/* LEFT COLUMN: Viewer + AI Insights */}
            <div style={styles.leftPanel}>
              <div style={styles.viewerCard}>
                <div style={styles.viewerHeader}>
                  <h3 style={styles.sectionTitle}>Image Analysis</h3>
                </div>

                <div style={styles.xrayImageArea}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  {!imageUploaded ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:bg-gray-50"
                      style={{
                        ...styles.uploadArea,
                        backgroundColor: isUploadDisabled ? 'rgba(255,255,255,0.02)' : (isDragging ? 'rgba(255,255,255,0.1)' : 'transparent'),
                        borderColor: isUploadDisabled ? 'rgba(255,255,255,0.1)' : (isDragging ? '#10b981' : 'rgba(255,255,255,0.2)'),
                        opacity: isUploadDisabled ? 0.5 : 1,
                        cursor: isUploadDisabled ? 'not-allowed' : 'pointer'
                      }} 
                      onClick={() => {
                        if (isUploadDisabled) return;
                        fileInputRef.current.click();
                      }}
                      onDragOver={(e) => {
                        if (isUploadDisabled) return;
                        handleDragOver(e);
                      }}
                      onDragLeave={() => {
                        if (isUploadDisabled) return;
                        handleDragLeave();
                      }}
                      onDrop={(e) => {
                        if (isUploadDisabled) return;
                        handleDrop(e);
                      }}
                    >
                      <UploadCloud size={48} color={isUploadDisabled ? "rgba(255,255,255,0.2)" : (isDragging ? '#10b981' : "rgba(255,255,255,0.4)")} style={{ marginBottom: '15px', transition: 'color 0.2s' }} />
                      <p style={{ color: isUploadDisabled ? 'rgba(255,255,255,0.4)' : 'white', fontWeight: 'bold', fontSize: '16px' }}>
                        {isUploadDisabled ? "Upload Disabled" : "Upload X-Ray or Intraoral Scan"}
                      </p>
                      <p style={{ color: isUploadDisabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '5px' }}>
                        {isUploadDisabled ? "Select a patient from search or via URL parameters to enable upload" : "Drag & Drop or Click to browse (JPG, JPEG, PNG)"}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.simulatedXray}>
                      {selectedFile && (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Patient X-Ray Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'fill', borderRadius: '10px' }}
                        />
                      )}

                      {/* Close Button to reset and access Drag & Drop again */}
                      {selectedFile && (
                        <button
                          onClick={() => {
                            setImageUploaded(false);
                            setSelectedFile(null);
                            setAnalysisComplete(false);
                            setFindings([]);
                            setDiagnosticData(null);
                            setIsZoomed(false);
                            setRotation(0);
                          }}
                          style={styles.closePreviewBtn}
                          title="Remove image and upload another"
                        >
                          <X size={16} color="white" />
                        </button>
                      )}

                      {isAnalyzing && (
                        <div style={styles.scannerLine}></div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* MOVED: AI Insights Card is now below the viewer */}
              <div style={styles.insightsCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={styles.sectionTitle}>AI Insight Analysis</h3>
                  {analysisComplete && (
                    <div style={styles.viewerActions}>
                      <button style={styles.vBtn} onClick={handleZoom} title={isZoomed ? "Zoom Out" : "Zoom In"}>
                        <ZoomIn size={14} /> {isZoomed ? "Zoom Out" : "Zoom In"}
                      </button>
                      <button style={styles.vBtn} onClick={handleRotate} title="Rotate 90°">
                        <RotateCw size={14} /> Rotate
                      </button>
                    </div>
                  )}
                </div>

                {!imageUploaded ? (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '20px' }}>Upload an image to begin the CNN analysis.</p>
                ) : isAnalyzing ? (
                  <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>Uploading & Analyzing Visual Data (CNN Model)...</p>
                  </div>
                ) : (
                  <div style={{ marginTop: '15px' }}>
                    {/* Render the analyzed image inside the insight card using the return response.file_path */}
                    <div style={styles.insightImageContainer}>
                      <div 
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'relative',
                          transform: `rotate(${rotation}deg) scale(${isZoomed ? 1.3 : 1})`,
                          transition: 'transform 0.3s ease',
                          cursor: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'/></svg>\") 0 20, crosshair",
                        }}
                      >
                        {diagnosticData && diagnosticData.file_path && (
                          <img
                            src={diagnosticData.file_path}
                            alt="AI Analyzed Scan"
                            style={styles.insightImage}
                          />
                        )}
                        
                        {/* Render predictions on top of the image */}
                        {showAI && findings && findings.map(finding => {
                          if (!finding.coordinates) return null;
                          
                          return (
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
                                  {finding.title} ({finding.confidence}%)
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {currentDraw && (
                          <div
                            style={{
                              position: 'absolute',
                              border: '2px dashed #10b981',
                              top: `${currentDraw.y * 100}%`,
                              left: `${currentDraw.x * 100}%`,
                              width: `${currentDraw.w * 100}%`,
                              height: `${currentDraw.h * 100}%`,
                              pointerEvents: 'none',
                              zIndex: 10
                            }}
                          />
                        )}

                        {pendingAnnotation && (
                          <div
                            style={{
                              position: 'absolute',
                              top: `${pendingAnnotation.y_min * 100}%`,
                              left: `${pendingAnnotation.x_min * 100}%`,
                              transform: 'translateY(-105%)',
                              zIndex: 20,
                              background: '#001166',
                              border: '1px solid #10b981',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              display: 'flex',
                              gap: '5px',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                              pointerEvents: 'auto'
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Pathology Name..."
                              value={annotationText}
                              onChange={(e) => setAnnotationText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveAnnotation();
                                if (e.key === 'Escape') handleCancelAnnotation();
                              }}
                              autoFocus
                              style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'white',
                                fontSize: '12px',
                                width: '120px'
                              }}
                            />
                            <button
                              onClick={handleSaveAnnotation}
                              style={{
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '3px',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                cursor: 'pointer'
                              }}
                            >
                              OK
                            </button>
                            <button
                              onClick={handleCancelAnnotation}
                              style={{
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '3px',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{findings.length} findings detected</span>
                      <button
                        style={styles.toggleBtn}
                        onClick={() => setShowAI(!showAI)}
                      >
                        {showAI ? 'Hide AI Overlays' : 'Show AI Overlays'}
                      </button>
                    </div>

                    {/* Grid Layout for findings */}
                    <div style={styles.findingsGrid}>
                      {findings.map((insight) => (
                        <div key={insight.id} style={{
                          ...styles.insightBox,
                          opacity: insight.status === 'rejected' ? 0.4 : 1,
                          borderLeft: insight.status === 'verified' ? '3px solid #10b981' : (insight.status === 'rejected' ? '3px solid #6b7280' : 'none')
                        }}>
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
                
                {analysisComplete && diagnosticData && diagnosticData.clinical_notes && (
                  <div style={styles.aiFindingsCard} className="ai-findings-scrollbar">
                    <h4 style={styles.aiFindingsHeader}>AI Generated Findings</h4>
                    <p style={styles.aiFindingsText}>{diagnosticData.clinical_notes}</p>
                  </div>
                )}

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

      {/* Dental Check Up Modal */}
      {isCheckUpModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white", padding: "30px", borderRadius: "15px", width: "600px", maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)", color: "#333"
          }}>
            {isSubmittingCheckUp ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                <div style={styles.loadingSpinner}></div>
                <p style={{ color: '#001166', fontWeight: 'bold', fontSize: '16px', marginTop: '20px' }}>Analyzing Oral Health Risk...</p>
                <p style={{ color: '#666', fontSize: '13px', marginTop: '5px' }}>Processing lifestyle metrics and clinical history via AI model</p>
              </div>
            ) : checkUpResponseData ? (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <div style={{ backgroundColor: "#e8f5e9", width: "60px", height: "60px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 20px auto" }}>
                  <Activity size={30} color="#2e7d32" />
                </div>
                <h2 style={{ color: "#001166", marginBottom: "15px", marginTop: 0 }}>Assessment Complete!</h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>The check-up data has been successfully processed by the AI.</p>

                <div style={{ backgroundColor: "#f0f2f5", padding: "20px", borderRadius: "10px", marginBottom: "25px", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "600", color: "#333" }}>Risk Score:</span>
                    <span style={{ fontWeight: "700", color: "#001166" }}>{checkUpResponseData.risk_score}/100</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "600", color: "#333" }}>Health Grade:</span>
                    <span style={{ fontWeight: "700", color: checkUpResponseData.risk_score > 60 ? "#d32f2f" : "#2e7d32" }}>{checkUpResponseData.health_grade}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <span style={{ fontWeight: "600", color: "#333" }}>Risk Level:</span>
                    <span style={{ fontWeight: "700", color: checkUpResponseData.risk_score > 60 ? "#d32f2f" : "#2e7d32" }}>{checkUpResponseData.risk_level}</span>
                  </div>
                  
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "15px", marginBottom: "15px" }}>
                    <span style={{ fontWeight: "600", color: "#333", display: "block", marginBottom: "5px" }}>Disease Progression Forecast:</span>
                    <span style={{ color: "#555", fontSize: "14px", lineHeight: "1.5", display: "block" }}>{checkUpResponseData.disease_progression_forecast}</span>
                  </div>
                  
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "15px" }}>
                    <span style={{ fontWeight: "600", color: "#333", display: "block", marginBottom: "5px" }}>Recommended Action:</span>
                    <span style={{ color: "#555", fontSize: "14px", lineHeight: "1.5", display: "block" }}>{checkUpResponseData.recommended_action}</span>
                  </div>
                </div>

                <button onClick={() => { setIsCheckUpModalOpen(false); setCheckUpResponseData(null); }} style={{ padding: "12px 30px", borderRadius: "8px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer", fontWeight: "700", width: "100%" }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ color: "#001166", margin: 0 }}>Dental Check Up</h2>
                  <X size={24} style={{ cursor: "pointer", color: "#666" }} onClick={() => setIsCheckUpModalOpen(false)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Age</label>
                    <input type="number" value={checkUpData.age} onChange={e => setCheckUpData({ ...checkUpData, age: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Sex</label>
                    <select value={checkUpData.sex} onChange={e => setCheckUpData({ ...checkUpData, sex: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}>
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Blood Type</label>
                    <input type="text" value={checkUpData.blood_type} onChange={e => setCheckUpData({ ...checkUpData, blood_type: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Occupation</label>
                    <input type="text" value={checkUpData.occupation} onChange={e => setCheckUpData({ ...checkUpData, occupation: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Allergies</label>
                    <input type="text" value={checkUpData.allergies} onChange={e => setCheckUpData({ ...checkUpData, allergies: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Sugar Intake Score (0-10)</label>
                    <input type="number" min="0" max="10" value={checkUpData.sugar_intake_score} onChange={e => setCheckUpData({ ...checkUpData, sugar_intake_score: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Brushing Freq (per day, 0-5)</label>
                    <input type="number" min="0" max="5" value={checkUpData.brushing_frequency} onChange={e => setCheckUpData({ ...checkUpData, brushing_frequency: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Flossing Freq (per day, 0-3)</label>
                    <input type="number" min="0" max="3" value={checkUpData.flossing_frequency} onChange={e => setCheckUpData({ ...checkUpData, flossing_frequency: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Last Visit (months ago)</label>
                    <input type="number" min="0" value={checkUpData.last_dental_visit_months_ago} onChange={e => setCheckUpData({ ...checkUpData, last_dental_visit_months_ago: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Previous Cavities</label>
                    <input type="number" min="0" value={checkUpData.previous_cavities} onChange={e => setCheckUpData({ ...checkUpData, previous_cavities: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Previous Extractions</label>
                    <input type="number" min="0" value={checkUpData.previous_extractions} onChange={e => setCheckUpData({ ...checkUpData, previous_extractions: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="checkbox" checked={checkUpData.smoking} onChange={e => setCheckUpData({ ...checkUpData, smoking: e.target.checked })} id="smokeCb" />
                    <label htmlFor="smokeCb" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Currently Smokes</label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="checkbox" checked={checkUpData.alcohol_use} onChange={e => setCheckUpData({ ...checkUpData, alcohol_use: e.target.checked })} id="alcoholCb" />
                    <label htmlFor="alcoholCb" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Alcohol Use</label>
                  </div>
                  <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="checkbox" checked={checkUpData.family_history_dental_disease} onChange={e => setCheckUpData({ ...checkUpData, family_history_dental_disease: e.target.checked })} id="historyCb" />
                    <label htmlFor="historyCb" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>Family History of Dental Disease</label>
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>Medical History Notes</label>
                    <textarea rows="3" value={checkUpData.medical_history_notes} onChange={e => setCheckUpData({ ...checkUpData, medical_history_notes: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box", fontFamily: "inherit" }}></textarea>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "25px" }}>
                  <button onClick={() => setIsCheckUpModalOpen(false)} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer", fontWeight: "600", color: "#333" }}>Close</button>
                  <button onClick={handleCheckUpSubmit} disabled={isSubmittingCheckUp} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#001166", color: "white", cursor: isSubmittingCheckUp ? "not-allowed" : "pointer", fontWeight: "600" }}>
                    {isSubmittingCheckUp ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', width: '100%' },
  searchBarContainer: {
    position: 'relative',
    marginBottom: '25px',
    width: '100%',
    maxWidth: '500px',
  },
  patientSearchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    padding: '12px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 17, 102, 0.05)',
    border: '1px solid rgba(0, 17, 102, 0.1)',
  },
  patientSearchInput: {
    border: 'none',
    background: 'transparent',
    marginLeft: '12px',
    outline: 'none',
    width: '100%',
    color: '#001166',
    fontSize: '15px',
    fontWeight: '500',
  },
  clearSearchBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  patientDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    width: '100%',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 17, 102, 0.15)',
    border: '1px solid rgba(0, 17, 102, 0.08)',
    zIndex: 100,
    overflow: 'hidden',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  dropdownMessage: {
    padding: '15px 20px',
    color: '#666',
    fontSize: '14px',
    textAlign: 'center',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0, 17, 102, 0.05)',
    transition: 'background-color 0.2s',
  },
  patientAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(0, 17, 102, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  patientInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  patientNameText: {
    margin: 0,
    fontWeight: '600',
    fontSize: '14px',
    color: '#001166',
  },
  patientEmailText: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
    marginTop: '2px',
  },
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

  infoBar: { display: 'grid', background: '#001166', borderRadius: '15px', padding: '20px', marginBottom: '25px', color: 'white' },
  infoCol: { borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 20px', textAlign: 'center' },
  infoLabel: { fontSize: '11px', opacity: 0.6, margin: '0 0 5px 0' },
  infoVal: { fontSize: '15px', fontWeight: 'bold', margin: 0 },
  checkUpBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", borderRadius: "10px", border: "none", backgroundColor: "#10b981", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "background-color 0.2s", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", outline: "none" },

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
  saveBtn: { width: '100%', marginTop: '15px', padding: '12px', background: 'white', color: '#001166', border: 'none', borderRadius: '10px', fontWeight: 'bold', transition: 'opacity 0.2s' },
  
  // File Ingestion Loading Spinner
  loadingSpinner: {
    border: '4px solid rgba(255, 255, 255, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: '#10b981',
    animation: 'spin 1s linear infinite',
  },
  insightImageContainer: {
    position: 'relative',
    width: '80%',
    height: '400px',
    margin: '0 auto 20px auto',
    backgroundColor: '#000833',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 0 50px rgba(0,0,0,0.5)',
  },
  insightImage: {
    width: '100%',
    height: '100%',
    objectFit: 'fill',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(0, 0, 0, 0.6)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'background-color 0.2s',
  },
  aiFindingsCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderLeft: '4px solid #10b981',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '15px',
    marginBottom: '15px',
    maxHeight: '530px',
    overflowY: 'auto',
  },
  aiFindingsHeader: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  aiFindingsText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.5',
    color: 'rgba(255, 255, 255, 0.85)',
  }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  * {
    box-sizing: border-box;
  }
  @keyframes scan { 
    0% { top: 0; opacity: 0; } 
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; } 
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .ai-findings-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .ai-findings-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .ai-findings-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
  .ai-findings-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;
document.head.appendChild(styleSheet);

export default DentistDiagnostics;