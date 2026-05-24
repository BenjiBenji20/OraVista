import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, LayoutDashboard, User, CalendarHeart, History,
  FileText, Settings, LogOut, CreditCard, Receipt, DollarSign
} from "lucide-react";

/* ─── Responsive styles injected once ─────────────────────────────────────── */
const STYLES = `
  * { box-sizing: border-box; }

  /* Sidebar nav item hover */
  .nav-item:hover { background-color: rgba(255,255,255,0.12) !important; }

  /* Bottom-nav hover/active on mobile */
  .bottom-nav-item:hover { background-color: rgba(255,255,255,0.12); border-radius: 10px; }
  .bottom-nav-item.active { color: #ffc107 !important; }
  .bottom-nav-item.active svg { stroke: #ffc107; }

  /* Hide sidebar on mobile, show bottom nav */
  @media (max-width: 768px) {
    .sidebar      { display: none !important; }
    .bottom-nav   { display: flex !important; }
    .main-content { margin-left: 0 !important; width: 100% !important; padding-bottom: 80px; }
    .page-pad     { padding: 30px 20px !important; }
    .page-title   { font-size: 28px !important; }
    .summary-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
    .summary-card { padding: 20px !important; }
    .summary-amt  { font-size: 24px !important; }
    .table-head   { display: none !important; }
    .table-row    { grid-template-columns: 1fr !important; gap: 6px !important; padding: 16px !important; }
    .table-row > div::before { content: attr(data-label); display: block; font-size: 11px; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .tab-btn      { padding: 10px 18px !important; font-size: 13px !important; }
    .table-wrap   { padding: 20px !important; border-radius: 20px !important; }
    .empty-state  { padding: 40px 0 !important; }
  }

  /* Collapsed sidebar tweaks */
  @media (min-width: 769px) {
    .bottom-nav { display: none !important; }
  }
`;

function BillingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState({ id: null, firstName: "User" });
  const [billings, setBillings] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  /* inject styles once */
  useEffect(() => {
    if (!document.getElementById("billings-responsive-styles")) {
      const tag = document.createElement("style");
      tag.id = "billings-responsive-styles";
      tag.textContent = STYLES;
      document.head.appendChild(tag);
    }
  }, []);

  const fetchBillings = useCallback(async (userId) => {
    try {
      const response = await fetch(
        `https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/user-appointments/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setBillings(data);
      }
    } catch (error) {
      console.error("Error fetching billings:", error);
    }
  }, []);

  const loadUser = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData({ id: user.id, firstName: user.firstName });
      fetchBillings(user.id);
    }
  }, [fetchBillings]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const pendingTransactions = billings.filter(
    (b) => ["Pending", "Approved", "Confirmed", "Reschedule"].includes(b.status)
  );
  const completedTransactions = billings.filter((b) => b.status === "Completed");
  const totalOutstanding = pendingTransactions.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalPaid        = completedTransactions.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  const sidebarWidth = isCollapsed ? "80px" : "260px";

  const navItemStyle = (path) => ({
    display: "flex", alignItems: "center", gap: "15px", color: "white",
    textDecoration: "none", padding: "12px 15px", margin: "5px 0",
    fontSize: "16px", cursor: "pointer", borderRadius: "10px",
    transition: "all 0.3s ease", whiteSpace: "normal",
    backgroundColor: location.pathname === path ? "rgba(255,255,255,0.2)" : "transparent",
    fontWeight: location.pathname === path ? "700" : "400",
    borderLeft: location.pathname === path ? "4px solid white" : "4px solid transparent",
  });

  /* ── Sidebar nav entries (shared between sidebar + bottom nav) ── */
  const navLinks = [
    { path: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/profile",   icon: <User size={20} />,            label: "Profile" },
    { path: "/booking",   icon: <CalendarHeart size={20} />,   label: "Book" },
    { path: "/appointments", icon: <History size={20} />,      label: "Appointments" },
    { path: "/records",   icon: <FileText size={20} />,        label: "Records" },
    { path: "/billings",  icon: <CreditCard size={20} />,      label: "Billings" },
  ];

  const currentRows = activeTab === "pending" ? pendingTransactions : completedTransactions;

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", backgroundColor: "white" }}>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <div
        className="sidebar"
        style={{
          width: sidebarWidth, backgroundColor: "#001166", height: "100vh",
          color: "white", padding: "20px 15px", position: "fixed",
          transition: "width 0.3s ease", zIndex: 1000,
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          {!isCollapsed && <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>OraVista</h2>}
          <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: "pointer" }}>
            {isCollapsed ? <Menu size={24} /> : <X size={24} />}
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          {navLinks.map(({ path, icon, label }) => (
            <div key={path} className="nav-item" style={navItemStyle(path)} onClick={() => navigate(path)}>
              <span style={{ flexShrink: 0 }}>{icon}</span>
              {!isCollapsed && label}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "10px" }}>
          <div className="nav-item" style={navItemStyle("/settings")} onClick={() => navigate("/settings")}>
            <Settings size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Settings"}
          </div>
          <div
            className="nav-item"
            style={{ ...navItemStyle("/logout"), color: "#ff4d4d" }}
            onClick={handleLogout}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />{!isCollapsed && "Logout"}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────────────────── */}
      <div
        className="bottom-nav"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          backgroundColor: "#001166", zIndex: 1000,
          justifyContent: "space-around", alignItems: "center",
          padding: "10px 0 12px", boxShadow: "0 -2px 15px rgba(0,0,20,0.3)",
        }}
      >
        {navLinks.map(({ path, icon, label }) => (
          <div
            key={path}
            className={`bottom-nav-item${location.pathname === path ? " active" : ""}`}
            onClick={() => navigate(path)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "3px", color: location.pathname === path ? "#ffc107" : "rgba(255,255,255,0.7)",
              cursor: "pointer", padding: "6px 8px", transition: "all 0.2s",
              fontSize: "10px", fontWeight: location.pathname === path ? "700" : "400",
            }}
          >
            {React.cloneElement(icon, {
              size: 20,
              style: { stroke: location.pathname === path ? "#ffc107" : "rgba(255,255,255,0.7)" }
            })}
            {label}
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div
        className="main-content"
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
          transition: "margin-left 0.3s ease",
        }}
      >
        <div className="page-pad" style={{ padding: "60px 80px" }}>

          {/* Header */}
          <h1
            className="page-title"
            style={{ color: "#001166", fontSize: "48px", fontWeight: "800", marginBottom: "10px" }}
          >
            {userData.firstName}'s Billing
          </h1>
          <p style={{ color: "#001166", fontWeight: "600", marginBottom: "40px" }}>
            Manage your payments and transaction history.
          </p>

          {/* Summary Cards */}
          <div
            className="summary-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}
          >
            <div
              className="summary-card"
              style={{
                backgroundColor: "#fff3cd", padding: "30px", borderRadius: "20px",
                display: "flex", alignItems: "center", gap: "20px", border: "1px solid #ffe69c",
              }}
            >
              <div style={{ backgroundColor: "#ffc107", padding: "15px", borderRadius: "50%", flexShrink: 0 }}>
                <DollarSign size={30} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, color: "#856404", fontWeight: "600", fontSize: "14px" }}>
                  Total Outstanding Balance
                </p>
                <h2 className="summary-amt" style={{ margin: "5px 0 0 0", color: "#856404", fontSize: "32px", fontWeight: "800" }}>
                  ₱{totalOutstanding.toLocaleString()}
                </h2>
              </div>
            </div>

            <div
              className="summary-card"
              style={{
                backgroundColor: "#d1e7dd", padding: "30px", borderRadius: "20px",
                display: "flex", alignItems: "center", gap: "20px", border: "1px solid #badbcc",
              }}
            >
              <div style={{ backgroundColor: "#198754", padding: "15px", borderRadius: "50%", flexShrink: 0 }}>
                <Receipt size={30} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, color: "#0f5132", fontWeight: "600", fontSize: "14px" }}>
                  Total Amount Paid
                </p>
                <h2 className="summary-amt" style={{ margin: "5px 0 0 0", color: "#0f5132", fontSize: "32px", fontWeight: "800" }}>
                  ₱{totalPaid.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
            {[
              { key: "pending", label: "Pending Transactions" },
              { key: "history", label: "Payment Records" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className="tab-btn"
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "12px 30px", borderRadius: "30px", border: "none",
                  fontWeight: "700", cursor: "pointer", transition: "all 0.3s",
                  backgroundColor: activeTab === key ? "#001166" : "#e8ebf5",
                  color: activeTab === key ? "white" : "#001166",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div
            className="table-wrap"
            style={{ backgroundColor: "#e8ebf5", borderRadius: "30px", padding: "40px" }}
          >
            {/* Desktop header row */}
            <div
              className="table-head"
              style={{
                display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr",
                padding: "0 20px 15px 20px", color: "#001166", fontWeight: "800",
                borderBottom: "2px dashed #001166", marginBottom: "20px",
              }}
            >
              <div>Ref No.</div>
              <div>Date</div>
              <div>Service Description</div>
              <div>Amount</div>
              <div style={{ textAlign: "center" }}>Status</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentRows.length > 0 ? (
                currentRows.map((item) => (
                  <div
                    key={item.id}
                    className="table-row"
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr",
                      backgroundColor: "white", padding: "22px 20px",
                      borderRadius: "15px", alignItems: "center",
                    }}
                  >
                    <div data-label="Ref No." style={{ color: "#666", fontWeight: "700", fontSize: "14px" }}>
                      {item.booking_ref}
                    </div>
                    <div data-label="Date" style={{ color: "#001166", fontWeight: "600" }}>
                      {new Date(item.appointment_date).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </div>
                    <div data-label="Service" style={{ color: "#001166" }}>
                      {item.service_type}
                    </div>
                    <div
                      data-label="Amount"
                      style={{
                        color: activeTab === "pending" ? "#ff9800" : "#28a745",
                        fontWeight: "800", fontSize: "16px",
                      }}
                    >
                      ₱{parseFloat(item.amount || 0).toLocaleString()}
                    </div>
                    <div data-label="Status" style={{ textAlign: "center" }}>
                      <span style={{
                        padding: "6px 15px", borderRadius: "20px", fontSize: "12px",
                        fontWeight: "700", color: "white",
                        backgroundColor: activeTab === "pending" ? "#ffc107" : "#10b981",
                      }}>
                        {activeTab === "pending" ? "Unpaid" : "Paid"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ textAlign: "center", padding: "60px 0", color: "#001166" }}>
                  <Receipt size={60} style={{ opacity: 0.2, marginBottom: "15px" }} />
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    {activeTab === "pending" ? "No pending transactions found." : "No payment records found."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingsPage;