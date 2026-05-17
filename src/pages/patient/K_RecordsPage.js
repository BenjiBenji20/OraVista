import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  LayoutDashboard,
  User,
  CalendarHeart,
  History,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Upload,
  ExternalLink,
  File,
  Activity
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function RecordsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [records, setRecords] = useState(null); // null = not yet loaded, [] = loaded but empty
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDentist, setSelectedDentist] = useState("");
  const dentistsList = ["Dr. Nick Messer", "Dr. Holly Briggs", "Dr. Pete Davis"];

  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({ id: null, firstName: "User" });
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [isCheckUpModalOpen, setIsCheckUpModalOpen] = useState(false);
  const [checkUpData, setCheckUpData] = useState({
    age: "", sex: "", blood_type: "", allergies: "", occupation: "",
    sugar_intake_score: 0, brushing_frequency: 0, flossing_frequency: 0,
    smoking: false, alcohol_use: false, previous_cavities: 0, previous_extractions: 0,
    family_history_dental_disease: false, last_dental_visit_months_ago: "", medical_history_notes: ""
  });
  const [isSubmittingCheckUp, setIsSubmittingCheckUp] = useState(false);
  const [checkUpResponseModal, setCheckUpResponseModal] = useState({ isOpen: false, data: null });

  const fetchRecords = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://oravista-server-temporary-754963692967.asia-southeast1.run.app/api/patient-records/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (userId) => {
    setIsDataLoading(true);
    try {
      const [analyticsRes, riskRes] = await Promise.all([
        fetch(`https://oravista-ai-engine-temporary-754963692967.asia-southeast1.run.app/api/patient/get/${userId}/analytics`),
        fetch(`https://oravista-ai-engine-temporary-754963692967.asia-southeast1.run.app/api/patient/get/${userId}/oral-health-risk`)
      ]);
      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      if (riskRes.ok) setRiskData(await riskRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  const loadUser = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData({ id: user.id, firstName: user.firstName || "User" });
      fetchRecords(user.id);
      fetchData(user.id);
    }
  }, [fetchRecords, fetchData]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleCheckUpSubmit = async () => {
    if (!userData.id) return;
    setIsSubmittingCheckUp(true);
    try {
      const payload = {
        patient_id: parseInt(userData.id),
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

      const res = await fetch("https://oravista-ai-engine-temporary-754963692967.asia-southeast1.run.app/api/patient/check-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const responseData = await res.json();
        setCheckUpResponseModal({ isOpen: true, data: responseData });
        setIsCheckUpModalOpen(false);
        setRiskData(responseData); // Immediately update AI Assessment Table
        fetchData(userData.id); // Refresh everything
        setCheckUpData({
          age: "", sex: "", blood_type: "", allergies: "", occupation: "",
          sugar_intake_score: 0, brushing_frequency: 0, flossing_frequency: 0,
          smoking: false, alcohol_use: false, previous_cavities: 0, previous_extractions: 0,
          family_history_dental_disease: false, last_dental_visit_months_ago: "", medical_history_notes: ""
        });
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  // ─── STAMP HELPER ────────────────────────────────────────────────────────────
  // jsPDF rotates text around its anchor point. We compute the border corners
  // by rotating the un-padded text rectangle around that same anchor so they
  // always stay in sync.
  // with stamp's border
  // const addStamp = (doc) => {
  //   const pageCount = doc.internal.getNumberOfPages();
  //   const text = "FOR PERSONAL USE ONLY";
  //   const angleDeg = 30;
  //   // jsPDF rotates text CCW, so for corner math we rotate CCW too (negate for standard rotation matrix)
  //   const angleRad = (angleDeg * Math.PI) / 180;

  //   for (let i = 1; i <= pageCount; i++) {
  //     doc.setPage(i);
  //     doc.saveGraphicsState();

  //     doc.setGState(new doc.GState({ opacity: 0.18 }));
  //     doc.setTextColor(76, 175, 80);
  //     doc.setDrawColor(76, 175, 80);
  //     doc.setFontSize(36);
  //     doc.setFont("helvetica", "bold");

  //     const pdfWidth = doc.internal.pageSize.width;
  //     const pdfHeight = doc.internal.pageSize.height;
  //     const cx = pdfWidth / 2;
  //     const cy = pdfHeight / 2;

  //     // Draw text first so getTextDimensions is accurate at the set font size
  //     doc.text(text, cx, cy, { angle: angleDeg, align: "center", baseline: "middle" });

  //     const dims = doc.getTextDimensions(text);
  //     const tw = dims.w;
  //     const th = dims.h;
  //     const pad = 6;

  //     const hw = tw / 2 + pad;
  //     const hh = th / 2 + pad;

  //     // jsPDF angle:30 = CCW rotation
  //     // Standard CCW rotation matrix: x' = x*cos - y*sin, y' = x*sin + y*cos
  //     // But jsPDF's Y axis points DOWN, so CCW visually = CW mathematically
  //     // To match jsPDF's rendered angle, use NEGATIVE angleRad in the rotation
  //     const cosA = Math.cos(-angleRad);
  //     const sinA = Math.sin(-angleRad);

  //     const rotate = (lx, ly) => ({
  //       x: cx + lx * cosA - ly * sinA,
  //       y: cy + lx * sinA + ly * cosA,
  //     });

  //     const tl = rotate(-hw, -hh);
  //     const tr = rotate(hw, -hh);
  //     const br = rotate(hw, hh);
  //     const bl = rotate(-hw, hh);

  //     // Match line width to the visual weight of the text strokes
  //     doc.setLineWidth(0.4);

  //     doc.line(tl.x, tl.y, tr.x, tr.y);
  //     doc.line(tr.x, tr.y, br.x, br.y);
  //     doc.line(br.x, br.y, bl.x, bl.y);
  //     doc.line(bl.x, bl.y, tl.x, tl.y);

  //     doc.restoreGraphicsState();
  //   }
  // };

  // without border
  const addStamp = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    const text = "FOR PERSONAL USE ONLY";
    const angleDeg = 30;

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.saveGraphicsState();

      doc.setGState(new doc.GState({ opacity: 0.18 }));
      doc.setTextColor(76, 175, 80);
      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");

      const pdfWidth = doc.internal.pageSize.width;
      const pdfHeight = doc.internal.pageSize.height;

      doc.text(text, pdfWidth / 2, pdfHeight / 2, {
        angle: angleDeg,
        align: "center",
        baseline: "middle",
      });

      doc.restoreGraphicsState();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const handleDownloadReport = async () => {
    if (!userData.id) { alert("User data not loaded yet."); return; }
    setIsDownloadingReport(true);

    try {
      const [analyticsRes, riskRes] = await Promise.all([
        fetch(`https://oravista-ai-engine-temporary-754963692967.asia-southeast1.run.app/api/patient/get/${userData.id}/analytics`),
        fetch(`https://oravista-ai-engine-temporary-754963692967.asia-southeast1.run.app/api/patient/get/${userData.id}/oral-health-risk`)
      ]);

      let aData = {};
      let rData = {};
      if (analyticsRes.ok) aData = await analyticsRes.json();
      if (riskRes.ok) rData = await riskRes.json();

      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(0, 17, 102);
      doc.text("OraVista Clinic", 14, 20);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Patient Report: ${userData.firstName}`, 14, 30);
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);

      let currentY = 50;

      // ── Table 1: Health Context ──────────────────────────────────────────────
      doc.setFontSize(14);
      doc.setTextColor(0, 17, 102);
      doc.text("Health Context & Lifestyle", 14, currentY);
      currentY += 5;

      const lifestyleBody = [];
      if (aData && Object.keys(aData).length > 0) {
        Object.entries(aData).forEach(([key, value]) => {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            lifestyleBody.push([label, String(value)]);
          }
        });
      }
      if (lifestyleBody.length === 0) lifestyleBody.push(["Data", "Not Available"]);

      autoTable(doc, {
        startY: currentY,
        head: [["Indicator", "Value"]],
        body: lifestyleBody,
        theme: "striped",
        headStyles: { fillColor: [0, 17, 102] }
      });
      currentY = doc.lastAutoTable.finalY + 15;

      // ── Table 2: AI Assessment ───────────────────────────────────────────────
      doc.setFontSize(14);
      doc.setTextColor(0, 17, 102);
      doc.text("AI Assessment", 14, currentY);
      currentY += 5;

      const assessmentBody = [];
      if (rData && Object.keys(rData).length > 0) {
        assessmentBody.push(["Risk Score", String(rData.risk_score ?? rData.score ?? "N/A")]);
        assessmentBody.push(["Risk Grade", String(rData.risk_grade ?? rData.grade ?? "N/A")]);
        assessmentBody.push(["Risk Level", String(rData.risk_level ?? rData.level ?? "N/A")]);
      } else {
        assessmentBody.push(["Data", "Not Available"]);
      }

      autoTable(doc, {
        startY: currentY,
        head: [["Metric", "Assessment"]],
        body: assessmentBody,
        theme: "striped",
        headStyles: { fillColor: [0, 17, 102] }
      });
      currentY = doc.lastAutoTable.finalY + 15;

      // ── Analysis section ─────────────────────────────────────────────────────
      // FIX: use the correct field names from the API response
      const forecastText =
        rData?.disease_progression_forecast ??
        rData?.forecast ??
        "No forecast available.";

      const actionsText =
        rData?.recommended_action ??       // singular (common API shape)
        rData?.recommended_actions ??      // plural variant
        rData?.actions ??
        "No actions recommended at this time.";

      doc.setFontSize(14);
      doc.setTextColor(0, 17, 102);
      doc.text("Analysis", 14, currentY);
      currentY += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "bold");
      doc.text("Disease Progression Forecast:", 14, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      const splitForecast = doc.splitTextToSize(String(forecastText), 180);
      doc.text(splitForecast, 14, currentY);
      currentY += splitForecast.length * 5 + 8;

      doc.setFont("helvetica", "bold");
      doc.text("Recommended Actions:", 14, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      const splitActions = doc.splitTextToSize(String(actionsText), 180);
      doc.text(splitActions, 14, currentY);

      // ── Stamp ────────────────────────────────────────────────────────────────
      addStamp(doc);

      doc.save(`${userData.firstName}_OraVista_Report.pdf`);

    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const formData = new FormData();
    formData.append("recordFile", file);
    formData.append("userId", user.id);
    formData.append("fileName", file.name);

    try {
      const response = await fetch("https://oravista-server-temporary-754963692967.asia-southeast1.run.app/api/upload-record", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("Record uploaded successfully!");
        fetchRecords(user.id);
      } else {
        alert("Failed to upload record.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Server error during upload.");
    } finally {
      e.target.value = null;
    }
  };

  const sidebarWidth = isCollapsed ? "80px" : "260px";

  const sidebarStyle = {
    width: sidebarWidth,
    backgroundColor: "#001166",
    height: "100vh",
    color: "white",
    padding: "20px 15px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    transition: "width 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    zIndex: 1000,
    boxSizing: "border-box",
  };

  const mainContainerStyle = {
    marginLeft: sidebarWidth,
    width: `calc(100% - ${sidebarWidth})`,
    backgroundColor: "white",
    minHeight: "100vh",
    transition: "margin-left 0.3s ease, width 0.3s ease",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  const getNavItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      color: "white",
      textDecoration: "none",
      padding: "12px 15px",
      margin: "5px 0",
      fontSize: "16px",
      cursor: "pointer",
      borderRadius: "10px",
      transition: "all 0.3s ease",
      whiteSpace: "normal",
      backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "transparent",
      fontWeight: isActive ? "700" : "400",
      borderLeft: isActive ? "4px solid white" : "4px solid transparent",
    };
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ display: "flex", justifyContent: isCollapsed ? "center" : "space-between", alignItems: "center", marginBottom: "40px" }}>
          {!isCollapsed && <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>OraVista</h2>}
          <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: "pointer" }}>
            {isCollapsed ? <Menu size={24} /> : <X size={24} />}
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <div style={getNavItemStyle("/dashboard")} onClick={() => navigate("/dashboard")}><LayoutDashboard size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Dashboard"}</div>
          <div style={getNavItemStyle("/profile")} onClick={() => navigate("/profile")}><User size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Profile"}</div>
          <div style={getNavItemStyle("/booking")} onClick={() => navigate("/booking")}><CalendarHeart size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Book an Appointment"}</div>
          <div style={getNavItemStyle("/appointments")} onClick={() => navigate("/appointments")}><History size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "My Appointments"}</div>
          <div style={getNavItemStyle("/records")} onClick={() => navigate("/records")}><FileText size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Records"}</div>
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "10px" }}>
          <div style={getNavItemStyle("/settings")} onClick={() => navigate("/settings")}><Settings size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Settings"}</div>
          <div style={{ ...getNavItemStyle("/logout"), color: "#ff4d4d" }} onClick={handleLogout}><LogOut size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Logout"}</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContainerStyle}>
        <div style={{ padding: "40px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <h1 style={{ color: "#001166", fontSize: "42px", fontWeight: "800", margin: 0 }}>Records</h1>
            <p style={{ color: "#001166", fontSize: "16px", fontWeight: "600" }}>Active User: {userData.firstName}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "15px", top: "12px", color: "#666" }} size={20} />
              <input type="text" placeholder="Search records here..." style={{ padding: "12px 15px 12px 45px", borderRadius: "25px", border: "none", backgroundColor: "#f0f2f5", width: "350px", fontSize: "14px" }} />
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <select value={selectedDentist} onChange={(e) => setSelectedDentist(e.target.value)}
                  style={{ appearance: "none", backgroundColor: "#e8ebf5", border: "none", padding: "12px 40px 12px 20px", borderRadius: "10px", color: "#001166", fontWeight: "600", cursor: "pointer", fontSize: "14px", minWidth: "160px" }}>
                  <option value="">All Dentists</option>
                  {dentistsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={18} style={{ position: "absolute", right: "15px", top: "12px", pointerEvents: "none", color: "#001166" }} />
              </div>
              <button style={{ padding: "12px 30px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", fontWeight: "700", cursor: "pointer" }}>Apply</button>
            </div>
          </div>

          {/* ── Records Table ──────────────────────────────────────────────────── */}
          {/* <div style={{ backgroundColor: "#f0f2f5", borderRadius: "20px", minHeight: "500px", padding: "30px", marginBottom: "30px" }}>
            {isLoading ? (
              <p style={{ color: "#666", textAlign: "center", marginTop: "200px" }}>Loading records...</p>
            ) : records === null ? (
              // Still initializing — shouldn't normally be seen after load
              <p style={{ color: "#666", textAlign: "center", marginTop: "200px" }}>Initializing...</p>
            ) : records.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "15px", color: "#001166" }}>File Name</th>
                    <th style={{ padding: "15px", color: "#001166" }}>Upload Date</th>
                    <th style={{ padding: "15px", color: "#001166", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} style={{ borderBottom: "1px solid #eee", backgroundColor: "white" }}>
                      <td style={{ padding: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <File size={20} color="#001166" /> {record.file_name}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {new Date(record.upload_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <a href={`https://oravista-server-temporary-754963692967.asia-southeast1.run.app/${record.file_path}`} target="_blank" rel="noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#001166", fontWeight: "700", textDecoration: "none" }}>
                          View <ExternalLink size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Only shown after fetch completes AND array is truly empty
              <p style={{ color: "#666", textAlign: "center", marginTop: "200px" }}>
                No dental records found for {userData.firstName}.
              </p>
            )}
          </div> */}

          {/* ── Analytics & Risk Tables ────────────────────────────────────────── */}
          <div style={{ backgroundColor: "#f0f2f5", borderRadius: "20px", padding: "30px", marginBottom: "30px" }}>
            <h2 style={{ color: "#001166", fontSize: "24px", fontWeight: "800", marginBottom: "20px", marginTop: 0 }}>Analytics & Health Risk Score</h2>

            {isDataLoading ? (
              <p style={{ color: "#666", textAlign: "center", padding: "50px 0" }}>Loading data...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

                {/* Table 1: Analytics */}
                <div>
                  <h3 style={{ color: "#001166", fontSize: "18px", marginBottom: "15px", marginTop: 0 }}>Health Context & Lifestyle</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "white", borderRadius: "10px", overflow: "hidden" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#001166", color: "white" }}>
                        <th style={{ padding: "15px" }}>Indicator</th>
                        <th style={{ padding: "15px" }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData && Object.keys(analyticsData).length > 0 ? (
                        Object.entries(analyticsData).map(([key, value], index) => {
                          if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return null;
                          const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <tr key={key} style={{ borderBottom: index < Object.keys(analyticsData).length - 1 ? "1px solid #eee" : "none" }}>
                              <td style={{ padding: "12px 15px", fontWeight: "600", color: "#333" }}>{label}</td>
                              <td style={{ padding: "12px 15px", color: "#666" }}>{String(value)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan="2" style={{ padding: "15px", textAlign: "center", color: "#666" }}>Data Not Available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table 2: AI Assessment */}
                <div>
                  <h3 style={{ color: "#001166", fontSize: "18px", marginBottom: "15px", marginTop: 0 }}>AI Assessment</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "white", borderRadius: "10px", overflow: "hidden" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#001166", color: "white" }}>
                        <th style={{ padding: "15px" }}>Metric</th>
                        <th style={{ padding: "15px" }}>Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskData && Object.keys(riskData).length > 0 ? (
                        <>
                          <tr style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "12px 15px", fontWeight: "600", color: "#333" }}>Risk Score</td>
                            <td style={{ padding: "12px 15px", color: "#666" }}>{String(riskData.risk_score ?? riskData.score ?? "N/A")}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "12px 15px", fontWeight: "600", color: "#333" }}>Risk Grade</td>
                            <td style={{ padding: "12px 15px", color: "#666" }}>{String(riskData.health_grade ?? riskData.risk_grade ?? riskData.grade ?? "N/A")}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "12px 15px", fontWeight: "600", color: "#333" }}>Risk Level</td>
                            <td style={{ padding: "12px 15px", color: "#666" }}>{String(riskData.risk_level ?? riskData.level ?? "N/A")}</td>
                          </tr>
                          {/* FIX: Render disease_progression_forecast */}
                          {(riskData.disease_progression_forecast || riskData.forecast) && (
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                              <td style={{ padding: "12px 15px", fontWeight: "600", color: "#333" }}>Disease Progression Forecast</td>
                              <td style={{ padding: "12px 15px", color: "#666", whiteSpace: "pre-wrap" }}>
                                {String(riskData.disease_progression_forecast ?? riskData.forecast)}
                              </td>
                            </tr>
                          )}
                          {/* FIX: Render recommended_action */}
                          {(riskData.recommended_action || riskData.recommended_actions || riskData.actions) && (
                            <tr>
                              <td style={{ padding: "12px 15px", fontWeight: "600", color: "#333" }}>Recommended Action</td>
                              <td style={{ padding: "12px 15px", color: "#666", whiteSpace: "pre-wrap" }}>
                                {String(riskData.recommended_action ?? riskData.recommended_actions ?? riskData.actions)}
                              </td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr><td colSpan="2" style={{ padding: "15px", textAlign: "center", color: "#666" }}>Data Not Available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-start", gap: "15px" }}>
            {/* <button onClick={() => fileInputRef.current.click()}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 25px", borderRadius: "10px", border: "none", backgroundColor: "#28a745", color: "white", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
              <Upload size={18} /> Upload Document
            </button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} /> */}

            {/* FIX THIS CHECK UP BUTTON change the Upload icon appropriately*/}
            <button
              onClick={() => setIsCheckUpModalOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "12px 25px", borderRadius: "10px", border: "none", backgroundColor: "#28a745", color: "white", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}>
              <Activity size={18} /> Dental Check Up
            </button>

            <button onClick={handleDownloadReport} disabled={isDownloadingReport}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 25px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", fontWeight: "700", cursor: isDownloadingReport ? "not-allowed" : "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", opacity: isDownloadingReport ? 0.7 : 1 }}>
              <FileText size={18} /> {isDownloadingReport ? "Generating..." : "Download Report"}
            </button>
          </div>

        </div>
      </div>

      {/* Check Up Form Modal */}
      {isCheckUpModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white", padding: "30px", borderRadius: "15px", width: "600px", maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
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
              <button onClick={() => setIsCheckUpModalOpen(false)} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer", fontWeight: "600" }}>Close</button>
              <button onClick={handleCheckUpSubmit} disabled={isSubmittingCheckUp} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#001166", color: "white", cursor: isSubmittingCheckUp ? "not-allowed" : "pointer", fontWeight: "600" }}>
                {isSubmittingCheckUp ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {checkUpResponseModal.isOpen && checkUpResponseModal.data && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white", padding: "40px", borderRadius: "15px", width: "500px", maxWidth: "90%",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)", textAlign: "center"
          }}>
            <div style={{ backgroundColor: "#e8f5e9", width: "60px", height: "60px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 20px auto" }}>
              <Activity size={30} color="#2e7d32" />
            </div>
            <h2 style={{ color: "#001166", marginBottom: "15px", marginTop: 0 }}>Assessment Complete!</h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>The check-up data has been successfully processed by the AI.</p>

            <div style={{ backgroundColor: "#f0f2f5", padding: "15px", borderRadius: "10px", marginBottom: "25px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontWeight: "600", color: "#333" }}>Risk Score:</span>
                <span style={{ fontWeight: "700", color: "#001166" }}>{checkUpResponseModal.data.risk_score}/100</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontWeight: "600", color: "#333" }}>Health Grade:</span>
                <span style={{ fontWeight: "700", color: checkUpResponseModal.data.risk_score > 60 ? "#d32f2f" : "#2e7d32" }}>{checkUpResponseModal.data.health_grade}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "600", color: "#333" }}>Risk Level:</span>
                <span style={{ fontWeight: "700", color: checkUpResponseModal.data.risk_score > 60 ? "#d32f2f" : "#2e7d32" }}>{checkUpResponseModal.data.risk_level}</span>
              </div>
            </div>

            <button onClick={() => setCheckUpResponseModal({ isOpen: false, data: null })} style={{ padding: "12px 30px", borderRadius: "8px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer", fontWeight: "700", width: "100%" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordsPage;