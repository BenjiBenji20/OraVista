import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Mail,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  User,
  CalendarHeart,
  History,
  FileText,
  Settings,
  LogOut,
  CreditCard // NEW: Imported CreditCard icon for Billings
} from "lucide-react";

// --- FUN FACT DATA ---
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [appLanguage] = useState(localStorage.getItem("language") || "English");

  const [userData, setUserData] = useState({
    firstName: "User",
    selectedBranch: "Select Branch",
  });

  const [funFact, setFunFact] = useState("");
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = useCallback(async (userId) => {
    try {
      const response = await fetch(`https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/user-appointments/${userId}`);
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
      setUserData({
        firstName: user.firstName || "User",
        selectedBranch: user.selectedBranch || "Gil Puyat, Pasay",
      });
      fetchAppointments(user.id);
    }

    const randomIndex = Math.floor(Math.random() * dentalFacts.length);
    setFunFact(dentalFacts[randomIndex]);
  }, [fetchAppointments]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const upcomingAppt = appointments.find(a => a.status === "Pending" || a.status === "Approved" || a.status === "Confirmed");

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
      overflow: "hidden",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
      fontWeight: isActive ? "700" : "400",
      borderLeft: isActive ? "4px solid white" : "4px solid transparent",
    };
  };

  const cardStyle = {
    backgroundColor: "#001166",
    borderRadius: "15px",
    padding: "25px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "220px",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: isCollapsed ? "center" : "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          {!isCollapsed && (
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
              OraVista
            </h2>
          )}
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ cursor: "pointer" }}
          >
            {isCollapsed ? <Menu size={24} /> : <X size={24} />}
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <div style={getNavItemStyle("/dashboard")} onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Dashboard"}
          </div>
          <div style={getNavItemStyle("/profile")} onClick={() => navigate("/profile")}>
            <User size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Profile"}
          </div>
          <div style={getNavItemStyle("/booking")} onClick={() => navigate("/booking")}>
            <CalendarHeart size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Book an Appointment"}
          </div>
          <div style={getNavItemStyle("/appointments")} onClick={() => navigate("/appointments")}>
            <History size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "My Appointments"}
          </div>
          <div style={getNavItemStyle("/records")} onClick={() => navigate("/records")}>
            <FileText size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Records"}
          </div>
          {/* NEW: Billings Button Added */}
          <div style={getNavItemStyle("/billings")} onClick={() => navigate("/billings")}>
            <CreditCard size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Billings"}
          </div>
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "10px" }}>
          <div style={getNavItemStyle("/settings")} onClick={() => navigate("/settings")}>
            <Settings size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Settings"}
          </div>
          <div style={{ ...getNavItemStyle("/logout"), color: "#ff4d4d" }} onClick={handleLogout}>
            <LogOut size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Logout"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContainerStyle}>
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div>
              <h1 style={{ color: "#001166", fontSize: "42px", fontWeight: "800", margin: 0 }}>
                {appLanguage === "Tagalog" ? "Mabuhay" : "Hi"}, {userData.firstName}
              </h1>
              <p style={{ color: "#001166", fontSize: "18px", marginTop: "5px" }}>
                You're in {userData.selectedBranch} Branch
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: "15px", top: "12px", color: "#666" }} size={20} />
                <input type="text" placeholder="Search here..." style={{ padding: "12px 15px 12px 45px", borderRadius: "25px", border: "none", backgroundColor: "#f0f2f5", width: "300px", fontSize: "14px" }} />
              </div>

              <Mail color="#001166" size={24} cursor="pointer" onClick={() => alert("Inbox is currently empty.")} />

              <div style={{ position: "relative" }}>
                <div style={{ cursor: "pointer", position: "relative" }} onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell color="#001166" size={24} />
                  <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", backgroundColor: "#ff4d4d", borderRadius: "50%", border: "2px solid white" }}></div>
                </div>

                {showNotifications && (
                  <div style={{ position: "absolute", top: "40px", right: "-10px", width: "320px", backgroundColor: "white", boxShadow: "0 15px 35px rgba(0,0,0,0.15)", borderRadius: "15px", padding: "20px", zIndex: 2000, border: "1px solid #f0f0f0" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>

            <div style={cardStyle}>
              <h3 style={{ margin: 0, fontSize: "20px" }}>Upcoming Appointment</h3>
              <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "10px" }}>
                {upcomingAppt ? (
                  <>
                    <p style={{ margin: "0 0 5px 0", fontSize: "22px", fontWeight: "700", color: "#10b981" }}>
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

            <div style={cardStyle}>
              <h3 style={{ margin: 0, fontSize: "20px" }}>Today's Fun Fact</h3>
              <div style={{ textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontStyle: "italic", fontSize: "15px", padding: "0 10px" }}>
                  Did you know? {funFact}
                </p>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: 0, fontSize: "20px" }}>Dental Summary</h3>
              <div style={{ textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ opacity: 0.8 }}>
                  No dental records yet. Your first visit will create your dental summary.
                </p>
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: "span 3", minHeight: "250px", marginTop: "10px", justifyContent: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "20px" }}>My Appointment History</h3>
                <button
                  onClick={() => navigate("/booking")}
                  style={{ padding: "8px 20px", backgroundColor: "white", color: "#001166", border: "none", borderRadius: "20px", fontWeight: "700", cursor: "pointer" }}
                >
                  Book Appointment
                </button>
              </div>

              <div style={{ overflowY: "auto", maxHeight: "150px", paddingRight: "5px" }}>
                {appointments.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
                        <th style={{ paddingBottom: "10px", fontWeight: "600" }}>Date</th>
                        <th style={{ paddingBottom: "10px", fontWeight: "600" }}>Service</th>
                        <th style={{ paddingBottom: "10px", fontWeight: "600" }}>Dentist</th>
                        <th style={{ paddingBottom: "10px", fontWeight: "600", textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <td style={{ padding: "12px 0" }}>{new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td style={{ padding: "12px 0" }}>{appt.service_type}</td>
                          <td style={{ padding: "12px 0" }}>{appt.dentist_name}</td>
                          <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "700", color: appt.status === "Pending" ? "#ffc107" : appt.status === "Cancelled" ? "#ff4d4d" : "#10b981" }}>
                            {appt.status || "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ display: "flex", height: "100px", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: "14px", opacity: 0.8, margin: 0 }}>
                      Message: You have no appointments yet. Book your first appointment now.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;