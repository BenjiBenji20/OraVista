import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  CalendarHeart,
  History,
  FileText,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  Calendar,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Save, 
  Pencil
} from "lucide-react";

function AppointmentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState({ id: null, firstName: "User" });
  
  const [isEditing, setIsEditing] = useState(false);
  const [backupAppointments, setBackupAppointments] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDentist, setSelectedDentist] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showSaveChanges, setShowSaveChanges] = useState(false); 
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  
  const [feedbackModal, setFeedbackModal] = useState({ show: false, message: "", type: "success" });

  // UPDATED: Actual dentist list
  const dentistsList = [
    "Therese Madrid DMD",
    "Queenie Balmedina DMD",
    "Vicente Epress II Dmd",
    "Carl Adrian Usi DMD",
    "Paulette Maliit DMD"
  ];
  
  const statusList = ["Approved", "Pending", "Cancelled", "Completed", "Reschedule"];

  const fetchAppointments = useCallback(async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-appointments/${userId}`);
      if (response.ok) { 
        const data = await response.json();
        const mappedData = data.map(appt => ({ ...appt, status: appt.status || "Pending" }));
        setAppointments(mappedData);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, []);

  const loadUser = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData({ id: user.id, firstName: user.firstName });
      fetchAppointments(user.id);
    }
  }, [fetchAppointments]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const showFeedback = (message, type = "success") => {
    setFeedbackModal({ show: true, message, type });
  };

  const handleEditClick = () => {
    setBackupAppointments(JSON.parse(JSON.stringify(appointments))); 
    setIsEditing(true);
  };

  const handleApplyClick = () => {
    setShowSaveChanges(true);
  };

  const handleConfirmSaveChanges = async () => {
    const modifiedAppointments = appointments.filter(appt => {
        const original = backupAppointments.find(b => b.id === appt.id);
        return original && original.status !== appt.status;
    });

    if (modifiedAppointments.length === 0) {
        setIsEditing(false);
        setShowSaveChanges(false);
        return;
    }

    try {
        await Promise.all(modifiedAppointments.map(appt => 
            fetch("http://localhost:5000/api/update-appointment-status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    appointment_id: appt.id, 
                    status: appt.status 
                }),
            })
        ));

        setIsEditing(false);
        setShowSaveChanges(false);
        showFeedback("Changes saved successfully!", "success");
    } catch (error) {
        showFeedback("Failed to save changes. Check connection.", "error");
    }
  };

  const handleDiscardChanges = () => {
    setAppointments(backupAppointments); 
    setIsEditing(false);
    setShowSaveChanges(false);
  };

  const handleStatusClick = (appt) => {
    if (!isEditing) return;
    const currentStatus = appt.status;
    if (currentStatus === "Pending") {
      setAppointmentToCancel(appt);
      setShowConfirmCancel(true);
    } else if (currentStatus === "Approved" || currentStatus === "Confirmed") {
      setAppointmentToCancel(appt);
      setShowCancelWarning(true);
    } 
  };

  const proceedToConfirmCancel = () => {
    setShowCancelWarning(false);
    setShowConfirmCancel(true);
  };

  const confirmCancellation = () => {
    const updatedList = appointments.map(a => 
        a.id === appointmentToCancel.id ? { ...a, status: "Cancelled" } : a
    );
    setAppointments(updatedList);
    setShowConfirmCancel(false);
    setAppointmentToCancel(null);
  };

  const getStatusStyle = (status) => {
    const base = { 
      padding: "8px 20px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", color: "white",
      display: "inline-block", width: "120px", textAlign: "center",
      cursor: isEditing && (status === "Pending" || status === "Approved" || status === "Confirmed") ? "pointer" : "not-allowed",
      opacity: isEditing ? 1 : 0.8, 
      boxShadow: isEditing && (status === "Pending" || status === "Approved" || status === "Confirmed") ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
      transition: "all 0.3s"
    };

    switch (status) {
      case "Approved":
      case "Confirmed": 
        return { ...base, backgroundColor: "#10b981" }; // Green
      case "Pending": 
        return { ...base, backgroundColor: "#ffc107" }; // Yellow
      case "Reschedule": 
        return { ...base, backgroundColor: "#007bff" }; 
      case "Completed": 
        return { ...base, backgroundColor: "#cc33cc" }; 
      case "Cancelled": 
        return { ...base, backgroundColor: "#ff4444" }; 
      default: 
        return { ...base, backgroundColor: "#ffc107" }; 
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const service = (appt.service_type || "").toLowerCase();
    const dentist = (appt.dentist_name || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = service.includes(search) || dentist.includes(search);
    const matchesDentist = selectedDentist ? appt.dentist_name === selectedDentist : true;
    const matchesStatus = selectedStatus ? appt.status === selectedStatus : true;

    return matchesSearch && matchesDentist && matchesStatus;
  });

  const sidebarWidth = isCollapsed ? "80px" : "260px";
  const getNavItemStyle = (path) => ({
    display: "flex", alignItems: "center", gap: "15px", color: "white", textDecoration: "none",
    padding: "12px 15px", margin: "5px 0", fontSize: "16px", cursor: "pointer", borderRadius: "10px",
    transition: "all 0.3s ease", whiteSpace: "normal",
    backgroundColor: location.pathname === path ? "rgba(255, 255, 255, 0.2)" : "transparent",
    fontWeight: location.pathname === path ? "700" : "400",
    borderLeft: location.pathname === path ? "4px solid white" : "4px solid transparent",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", backgroundColor: "white" }}>
      
      {feedbackModal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 4000 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "350px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            {feedbackModal.type === "success" ? (
              <CheckCircle2 size={50} color="#28a745" style={{ marginBottom: "15px", margin: "0 auto" }} />
            ) : (
              <XCircle size={50} color="#ff4d4d" style={{ marginBottom: "15px", margin: "0 auto" }} />
            )}
            <h3 style={{ color: "#001166", fontWeight: "800", marginBottom: "10px" }}>
              {feedbackModal.type === "success" ? "Done!" : "Error"}
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>{feedbackModal.message}</p>
            <button onClick={() => setFeedbackModal({ ...feedbackModal, show: false })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", fontWeight: "700", cursor: "pointer" }}>
              Okay
            </button>
          </div>
        </div>
      )}

      {showSaveChanges && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3500 }}>
           <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "400px" }}>
              <Save size={50} color="#001166" style={{ marginBottom: "15px", margin: "0 auto" }} />
              <h3 style={{ color: "#001166", fontWeight: "800" }}>Save Changes?</h3>
              <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px" }}>
                Do you want to save the changes you made to your appointments?
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                 <button onClick={handleDiscardChanges} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer" }}>No</button>
                 <button onClick={handleConfirmSaveChanges} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer" }}>Yes</button>
              </div>
           </div>
        </div>
      )}

      {showCancelWarning && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 }}>
           <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "400px" }}>
              <AlertTriangle size={50} color="#ff9800" style={{ marginBottom: "15px", margin: "0 auto" }} />
              <h3 style={{ color: "#001166", fontWeight: "800" }}>Cancel Policy Warning</h3>
              <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px" }}>
                You can only cancel <strong>one approved appointment per week</strong>. Proceeding may affect your ability to book future slots immediately.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                 <button onClick={() => setShowCancelWarning(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer" }}>Go Back</button>
                 <button onClick={proceedToConfirmCancel} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#ff4d4d", color: "white", cursor: "pointer" }}>Proceed</button>
              </div>
           </div>
        </div>
      )}

      {showConfirmCancel && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 }}>
           <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "400px" }}>
              <XCircle size={50} color="#ff4d4d" style={{ marginBottom: "15px", margin: "0 auto" }} />
              <h3 style={{ color: "#001166", fontWeight: "800" }}>Mark for Cancellation?</h3>
              <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px" }}>
                This will mark the appointment with {appointmentToCancel?.dentist_name} as cancelled. Click "Apply" to save.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                 <button onClick={() => setShowConfirmCancel(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer" }}>Cancel</button>
                 <button onClick={confirmCancellation} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#ff4d4d", color: "white", cursor: "pointer" }}>Confirm</button>
              </div>
           </div>
        </div>
      )}

      <div style={{ width: sidebarWidth, backgroundColor: "#001166", height: "100vh", color: "white", padding: "20px 15px", position: "fixed", transition: "width 0.3s ease", zIndex: 1000, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          {!isCollapsed && <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>OraVista</h2>}
          <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: "pointer" }}>{isCollapsed ? <Menu size={24}/> : <X size={24}/>}</div>
        </div>
        <nav style={{ flexGrow: 1 }}>
          <div style={getNavItemStyle("/dashboard")} onClick={() => navigate("/dashboard")}><LayoutDashboard size={20} /> {!isCollapsed && "Dashboard"}</div>
          <div style={getNavItemStyle("/profile")} onClick={() => navigate("/profile")}><User size={20} /> {!isCollapsed && "Profile"}</div>
          <div style={getNavItemStyle("/booking")} onClick={() => navigate("/booking")}><CalendarHeart size={20} /> {!isCollapsed && "Book an Appointment"}</div>
          <div style={getNavItemStyle("/appointments")} onClick={() => navigate("/appointments")}><History size={20} /> {!isCollapsed && "My Appointments"}</div>
          <div style={getNavItemStyle("/records")} onClick={() => navigate("/records")}><FileText size={20} /> {!isCollapsed && "Records"}</div>
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "10px" }}>
          <div style={getNavItemStyle("/settings")} onClick={() => navigate("/settings")}><Settings size={20} /> {!isCollapsed && "Settings"}</div>
          <div style={{ ...getNavItemStyle("/logout"), color: "#ff4d4d" }} onClick={handleLogout}><LogOut size={20} /> {!isCollapsed && "Logout"}</div>
        </div>
      </div>

      <div style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, transition: "margin-left 0.3s ease" }}>
        <div style={{ padding: "60px 80px" }}>
          <h1 style={{ color: "#001166", fontSize: "48px", fontWeight: "800", marginBottom: "10px" }}>My Appointments</h1>
          <p style={{ color: "#001166", fontWeight: "600", marginBottom: "40px" }}>Welcome, {userData.firstName}!</p>
          
          <div style={{ display: "flex", gap: "15px", marginBottom: "35px", alignItems: "center" }}>
            <div style={{ position: "relative", width: "300px" }}>
              <Search size={20} style={{ position: "absolute", left: "15px", top: "12px", color: "#666" }} />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "12px 15px 12px 45px", borderRadius: "30px", border: "none", backgroundColor: "#e8ebf5", fontSize: "16px", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ position: "relative" }}>
               <select value={selectedDentist} onChange={(e) => setSelectedDentist(e.target.value)} style={{ appearance: "none", backgroundColor: "#e8ebf5", border: "none", padding: "12px 40px 12px 20px", borderRadius: "10px", color: "#001166", fontWeight: "600", cursor: "pointer", fontSize: "14px", minWidth: "160px" }}>
                  <option value="">All Dentists</option>
                  {dentistsList.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
               <ChevronDown size={18} style={{ position: "absolute", right: "15px", top: "12px", pointerEvents: "none", color: "#001166" }} />
            </div>

            <div style={{ position: "relative" }}>
               <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ appearance: "none", backgroundColor: "#e8ebf5", border: "none", padding: "12px 40px 12px 20px", borderRadius: "10px", color: "#001166", fontWeight: "600", cursor: "pointer", fontSize: "14px", minWidth: "160px" }}>
                  <option value="">All Statuses</option>
                  {statusList.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <ChevronDown size={18} style={{ position: "absolute", right: "15px", top: "12px", pointerEvents: "none", color: "#001166" }} />
            </div>

            {isEditing ? (
                <button 
                  onClick={handleApplyClick} 
                  style={{ backgroundColor: "#28a745", border: "none", padding: "12px 35px", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer", marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Save size={18} /> Apply
                </button>
            ) : (
                <button 
                  onClick={handleEditClick} 
                  style={{ backgroundColor: "#001166", border: "none", padding: "12px 35px", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer", marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Pencil size={18} /> Edit
                </button>
            )}
          </div>

          <div style={{ backgroundColor: "#e8ebf5", borderRadius: "30px", padding: "40px" }}>
            {/* UPDATED: Added Price Column to the Header Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr 1fr 1fr", padding: "0 20px 15px 20px", color: "#001166", fontWeight: "800", borderBottom: "2px dashed #001166", marginBottom: "20px" }}>
              <div>Date</div>
              <div>Service</div>
              <div>Dentist</div>
              <div>Base Price</div>
              <div style={{ textAlign: "center" }}>Status</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  // UPDATED: Added Price Display to the Row Grid
                  <div key={appt.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr 1fr 1fr", backgroundColor: "white", padding: "22px 20px", borderRadius: "15px", alignItems: "center" }}>
                    <div style={{ color: "#001166", fontWeight: "600" }}>{new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div style={{ color: "#001166" }}>{appt.service_type}</div>
                    <div style={{ color: "#001166" }}>{appt.dentist_name}</div>
                    <div style={{ color: "#28a745", fontWeight: "700" }}>₱{appt.amount ? parseFloat(appt.amount).toLocaleString() : "0"}</div>
                    <div style={{ textAlign: "center" }}>
                      <span 
                        onClick={() => handleStatusClick(appt)} 
                        style={getStatusStyle(appt.status)}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#001166" }}>
                  <Calendar size={60} style={{ opacity: 0.2, marginBottom: "15px" }} />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>No appointments found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentsPage;