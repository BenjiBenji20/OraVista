import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search, Mail, Bell, Menu, X, LayoutDashboard, User,
  CalendarHeart, History, FileText, Settings, LogOut,
  CreditCard, ChevronUp
} from "lucide-react";

const dentalFacts = [
  "Flossing can remove up to 40% of the plaque between your teeth.",
  "Tooth enamel is the hardest substance in the human body, even harder than bone.",
  "The average person spends about 38.5 days brushing their teeth over a lifetime.",
  "Just like your fingerprints, your tongue print and tooth pattern are completely unique to you.",
  "Your mouth produces about a liter of saliva every single day.",
  "Cotton candy was surprisingly co-invented by a dentist and was originally called 'fairy floss'.",
  "The oldest known dental filling is 6,500 years old and was made of beeswax.",
  "Contrary to the popular myth, George Washington never had wooden teeth.",
  "Your mouth is home to over 6 billion bacteria.",
  "Just because teeth look white doesn't always mean they are completely healthy."
];

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [appLanguage] = useState(localStorage.getItem("language") || "English");
  const [userData, setUserData] = useState({ firstName: "User", selectedBranch: "Select Branch" });
  const [funFact, setFunFact] = useState("");
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = useCallback(async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-appointments/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData({ firstName: user.firstName || "User", selectedBranch: user.selectedBranch || "Gil Puyat, Pasay" });
      fetchAppointments(user.id);
    }
    setFunFact(dentalFacts[Math.floor(Math.random() * dentalFacts.length)]);
  }, [fetchAppointments]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const upcomingAppt = appointments.find(a => ["Pending","Approved","Confirmed"].includes(a.status));
  const sidebarWidth = isCollapsed ? "80px" : "260px";

  const getNavItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: "flex", alignItems: "center", gap: "15px",
      color: "white", textDecoration: "none",
      padding: "12px 15px", margin: "5px 0", fontSize: "15px",
      cursor: "pointer", borderRadius: "10px", transition: "all 0.3s ease",
      whiteSpace: "normal", overflow: "hidden",
      backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "transparent",
      fontWeight: isActive ? "700" : "400",
      borderLeft: isActive ? "4px solid white" : "4px solid transparent",
    };
  };

  const cardStyle = {
    backgroundColor: "#001166", borderRadius: "15px", padding: "25px",
    color: "white", display: "flex", flexDirection: "column",
    justifyContent: "space-between", minHeight: "220px",
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── DESKTOP BASE ── */
        .mobile-top-bar { display: none; }
        .sidebar-overlay { display: none; }

        .sidebar-container {
          width: ${sidebarWidth};
          background-color: #001166;
          height: 100vh;
          color: white;
          padding: 20px 15px;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0;
          transition: width 0.3s ease, transform 0.3s ease;
          font-family: 'Poppins', sans-serif;
          z-index: 1000;
          box-sizing: border-box;
        }
        .sidebar-desktop-toggle-btn { display: flex; cursor: pointer; }
        .sidebar-mobile-close-btn   { display: none; cursor: pointer; }

        .admin-main-content {
          margin-left: ${sidebarWidth};
          width: calc(100% - ${sidebarWidth});
          background-color: white;
          min-height: 100vh;
          transition: margin-left 0.3s ease, width 0.3s ease;
          font-family: 'Poppins', sans-serif;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .desktop-search-box  { display: flex !important; }
        .patient-search-toggle-btn  { display: none !important; }
        .patient-search-collapsible { display: none !important; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .mobile-top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 16px;
            height: 56px;
            background-color: #001166;
            color: white;
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1100;
          }
          .mobile-hamburger-btn {
            background: none; border: none; color: white;
            cursor: pointer; padding: 4px;
            display: flex; align-items: center;
          }

          /* Sidebar slides in */
          .sidebar-container {
            width: 260px !important;
            transform: translateX(-100%);
          }
          .sidebar-container.sidebar-open { transform: translateX(0); }
          .sidebar-desktop-toggle-btn { display: none !important; }
          .sidebar-mobile-close-btn   { display: flex !important; }

          /* Overlay */
          .sidebar-overlay {
            display: none;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }
          .sidebar-overlay.active { display: block; }

          /* Main shifts up, full width */
          .admin-main-content {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 56px;
            overflow-x: hidden;
          }

          /* Content padding */
          .patient-content-wrapper {
            padding: 16px !important;
            gap: 16px !important;
            width: 100% !important;
            overflow-x: hidden !important;
          }

          /* ── HEADER: greeting left, icons right, same row ── */
          .patient-header-row {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .patient-header-text h1 { font-size: 22px !important; }
          .patient-header-text p  { font-size: 12px !important; margin-top: 2px !important; }

          .patient-header-actions {
            gap: 14px !important;
            flex-shrink: 0;
          }
          .desktop-search-box         { display: none !important; }
          .patient-search-toggle-btn  { display: flex !important; }
          .patient-search-collapsible { display: block !important; width: 100%; }

          /* ── GRID: single column, no overflow ── */
          .patient-dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            width: 100% !important;
          }
          .grid-span-3 {
            grid-column: span 1 !important;
          }

          /* ── CARDS: contained ── */
          .dashboard-card {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            min-height: auto !important;
            padding: 18px !important;
            box-sizing: border-box !important;
          }
          .dashboard-card h3      { font-size: 16px !important; }
          .dashboard-card p       { font-size: 13px !important; }
          .upcoming-date          { font-size: 18px !important; }

          .history-table th,
          .history-table td       { font-size: 11px !important; padding: 7px 4px !important; }
          .book-btn               { padding: 6px 12px !important; font-size: 12px !important; }

          /* Notification dropdown */
          .notif-dropdown {
            right: 0 !important;
            width: calc(100vw - 32px) !important;
            max-width: 300px !important;
          }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", width: "100%", flexDirection: "column" }}>

        {/* ── MOBILE TOP BAR ── */}
        <header className="mobile-top-bar">
          <button className="mobile-hamburger-btn" onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle Menu">
            <Menu size={24} />
          </button>
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>OraVista</span>
          <div style={{ width: "24px" }} />
        </header>

        <div style={{ display: "flex", flex: 1, position: "relative" }}>

          {/* Backdrop */}
          <div className={`sidebar-overlay${isMobileOpen ? " active" : ""}`} onClick={() => setIsMobileOpen(false)} />

          {/* ── SIDEBAR ── */}
          <div className={`sidebar-container${isMobileOpen ? " sidebar-open" : ""}`}>
            <div style={{ display: "flex", justifyContent: isCollapsed ? "center" : "space-between", alignItems: "center", marginBottom: "40px" }}>
              {!isCollapsed && <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>OraVista</h2>}
              <div onClick={() => setIsCollapsed(!isCollapsed)} className="sidebar-desktop-toggle-btn">
                {isCollapsed ? <Menu size={24} /> : <X size={24} />}
              </div>
              <div onClick={() => setIsMobileOpen(false)} className="sidebar-mobile-close-btn">
                <X size={24} />
              </div>
            </div>

            <nav style={{ flexGrow: 1 }}>
              {[
                { path: "/dashboard",    icon: <LayoutDashboard size={20} style={{ flexShrink: 0 }} />, label: "Dashboard" },
                { path: "/profile",      icon: <User size={20} style={{ flexShrink: 0 }} />,            label: "Profile" },
                { path: "/booking",      icon: <CalendarHeart size={20} style={{ flexShrink: 0 }} />,   label: "Book an Appointment" },
                { path: "/appointments", icon: <History size={20} style={{ flexShrink: 0 }} />,         label: "My Appointments" },
                { path: "/records",      icon: <FileText size={20} style={{ flexShrink: 0 }} />,        label: "Records" },
                { path: "/billings",     icon: <CreditCard size={20} style={{ flexShrink: 0 }} />,      label: "Billings" },
              ].map(({ path, icon, label }) => (
                <div key={path} style={getNavItemStyle(path)} onClick={() => { navigate(path); setIsMobileOpen(false); }}>
                  {icon} {!isCollapsed && label}
                </div>
              ))}
            </nav>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "10px" }}>
              <div style={getNavItemStyle("/settings")} onClick={() => { navigate("/settings"); setIsMobileOpen(false); }}>
                <Settings size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Settings"}
              </div>
              <div style={{ ...getNavItemStyle("/logout"), color: "#ff4d4d" }} onClick={() => { handleLogout(); setIsMobileOpen(false); }}>
                <LogOut size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Logout"}
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="admin-main-content">
            <div className="patient-content-wrapper" style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "25px" }}>

              {/* ── HEADER ROW ── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }} className="patient-header-row">
                <div className="patient-header-text">
                  <h1 style={{ color: "#001166", fontSize: "42px", fontWeight: "800", margin: 0 }}>
                    {appLanguage === "Tagalog" ? "Mabuhay" : "Hi"}, {userData.firstName}
                  </h1>
                  <p style={{ color: "#001166", fontSize: "18px", marginTop: "5px", margin: 0 }}>
                    You're in {userData.selectedBranch} Branch
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "25px" }} className="patient-header-actions">
                  {/* Mobile search toggle */}
                  <button
                    className="patient-search-toggle-btn"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#001166", padding: "4px", display: "flex", alignItems: "center" }}
                  >
                    {isSearchOpen ? <ChevronUp size={22} /> : <Search size={22} />}
                  </button>

                  {/* Desktop search */}
                  <div style={{ position: "relative" }} className="desktop-search-box">
                    <Search style={{ position: "absolute", left: "15px", top: "12px", color: "#666" }} size={20} />
                    <input type="text" placeholder="Search here..." style={{ padding: "12px 15px 12px 45px", borderRadius: "25px", border: "none", backgroundColor: "#f0f2f5", width: "300px", fontSize: "14px" }} />
                  </div>

                  <Mail color="#001166" size={22} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => alert("Inbox is currently empty.")} />

                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ cursor: "pointer", position: "relative" }} onClick={() => setShowNotifications(!showNotifications)}>
                      <Bell color="#001166" size={22} />
                      <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", backgroundColor: "#ff4d4d", borderRadius: "50%", border: "2px solid white" }} />
                    </div>
                    {showNotifications && (
                      <div className="notif-dropdown" style={{ position: "absolute", top: "40px", right: "-10px", width: "320px", backgroundColor: "white", boxShadow: "0 15px 35px rgba(0,0,0,0.15)", borderRadius: "15px", padding: "20px", zIndex: 2000, border: "1px solid #f0f0f0" }}>
                        <h4 style={{ margin: "0 0 15px 0", color: "#001166", borderBottom: "2px solid #f0f4ff", paddingBottom: "10px" }}>Notifications</h4>
                        <div style={{ marginBottom: "12px", padding: "12px", backgroundColor: "#f0f4ff", borderRadius: "10px", borderLeft: "4px solid #001166" }}>
                          <p style={{ margin: 0, fontSize: "14px", color: "#001166", fontWeight: "700" }}>Welcome to OraVista!</p>
                          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#555", lineHeight: "1.4" }}>Please complete your profile details to make booking appointments faster.</p>
                        </div>
                        <div style={{ padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "10px", borderLeft: "4px solid #ccc" }}>
                          <p style={{ margin: 0, fontSize: "14px", color: "#333", fontWeight: "700" }}>System Reminder</p>
                          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#777", lineHeight: "1.4" }}>Check your appointment history regularly to stay updated on your dental health.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible search (mobile only) */}
              {isSearchOpen && (
                <div className="patient-search-collapsible">
                  <div style={{ position: "relative", width: "100%" }}>
                    <Search style={{ position: "absolute", left: "15px", top: "12px", color: "#666" }} size={20} />
                    <input type="text" placeholder="Search here..." style={{ padding: "12px 15px 12px 45px", borderRadius: "25px", border: "1px solid #ddd", backgroundColor: "#f0f2f5", width: "100%", fontSize: "14px", boxSizing: "border-box" }} />
                  </div>
                </div>
              )}

              {/* ── DASHBOARD GRID ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }} className="patient-dashboard-grid">

                <div style={cardStyle} className="dashboard-card">
                  <h3 style={{ margin: 0, fontSize: "20px" }}>Upcoming Appointment</h3>
                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "10px" }}>
                    {upcomingAppt ? (
                      <>
                        <p className="upcoming-date" style={{ margin: "0 0 5px 0", fontSize: "22px", fontWeight: "700", color: "#10b981" }}>
                          {new Date(upcomingAppt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p style={{ margin: "0 0 5px 0", fontSize: "15px", fontWeight: "600" }}>{upcomingAppt.appointment_time}</p>
                        <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>{upcomingAppt.service_type}</p>
                      </>
                    ) : (
                      <p style={{ opacity: 0.8 }}>No upcoming appointment</p>
                    )}
                  </div>
                </div>

                <div style={cardStyle} className="dashboard-card">
                  <h3 style={{ margin: 0, fontSize: "20px" }}>Today's Fun Fact</h3>
                  <div style={{ textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontStyle: "italic", fontSize: "15px", padding: "0 10px" }}>Did you know? {funFact}</p>
                  </div>
                </div>

                <div style={cardStyle} className="dashboard-card">
                  <h3 style={{ margin: 0, fontSize: "20px" }}>Dental Summary</h3>
                  <div style={{ textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ opacity: 0.8 }}>No dental records yet. Your first visit will create your dental summary.</p>
                  </div>
                </div>

                {/* Full-width appointment history */}
                <div style={{ ...cardStyle, gridColumn: "span 3", minHeight: "250px", marginTop: "10px", justifyContent: "flex-start" }} className="dashboard-card grid-span-3">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <h3 style={{ margin: 0, fontSize: "20px" }}>My Appointment History</h3>
                    <button
                      className="book-btn"
                      onClick={() => navigate("/booking")}
                      style={{ padding: "8px 20px", backgroundColor: "white", color: "#001166", border: "none", borderRadius: "20px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Book Appointment
                    </button>
                  </div>
                  <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "180px" }}>
                    {appointments.length > 0 ? (
                      <table className="history-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left", minWidth: "420px" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
                            <th style={{ paddingBottom: "10px", fontWeight: "600", whiteSpace: "nowrap" }}>Date</th>
                            <th style={{ paddingBottom: "10px", fontWeight: "600" }}>Service</th>
                            <th style={{ paddingBottom: "10px", fontWeight: "600", whiteSpace: "nowrap" }}>Dentist</th>
                            <th style={{ paddingBottom: "10px", fontWeight: "600", textAlign: "right", whiteSpace: "nowrap" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appt) => (
                            <tr key={appt.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                              <td style={{ padding: "10px 0", whiteSpace: "nowrap" }}>{new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td style={{ padding: "10px 0" }}>{appt.service_type}</td>
                              <td style={{ padding: "10px 0", whiteSpace: "nowrap" }}>{appt.dentist_name}</td>
                              <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "700", whiteSpace: "nowrap", color: appt.status === "Pending" ? "#ffc107" : appt.status === "Cancelled" ? "#ff4d4d" : "#10b981" }}>
                                {appt.status || "Pending"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ display: "flex", height: "100px", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                        <p style={{ fontSize: "14px", opacity: 0.8, margin: 0 }}>You have no appointments yet. Book your first appointment now.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;