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
  CreditCard,
  Receipt,
  DollarSign
} from "lucide-react";

function BillingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState({ id: null, firstName: "User" });
  const [billings, setBillings] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'history'

  const fetchBillings = useCallback(async (userId) => {
    try {
      // Reusing the appointments API since it contains amounts, refs, and statuses!
      const response = await fetch(`https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/user-appointments/${userId}`);
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

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  // --- Filter Data for Transparency ---
  // Pending transactions are appointments that are not yet cancelled or completed
  const pendingTransactions = billings.filter(
    (b) => b.status === "Pending" || b.status === "Approved" || b.status === "Confirmed" || b.status === "Reschedule"
  );

  // Completed transactions are appointments marked as Completed (Paid)
  const completedTransactions = billings.filter((b) => b.status === "Completed");

  // Calculate Totals
  const totalOutstanding = pendingTransactions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalPaid = completedTransactions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

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
      {/* SIDEBAR */}
      <div style={{ width: sidebarWidth, backgroundColor: "#001166", height: "100vh", color: "white", padding: "20px 15px", position: "fixed", transition: "width 0.3s ease", zIndex: 1000, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          {!isCollapsed && <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>OraVista</h2>}
          <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: "pointer" }}>{isCollapsed ? <Menu size={24} /> : <X size={24} />}</div>
        </div>
        <nav style={{ flexGrow: 1 }}>
          <div style={getNavItemStyle("/dashboard")} onClick={() => navigate("/dashboard")}><LayoutDashboard size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Dashboard"}</div>
          <div style={getNavItemStyle("/profile")} onClick={() => navigate("/profile")}><User size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Profile"}</div>
          <div style={getNavItemStyle("/booking")} onClick={() => navigate("/booking")}><CalendarHeart size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Book an Appointment"}</div>
          <div style={getNavItemStyle("/appointments")} onClick={() => navigate("/appointments")}><History size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "My Appointments"}</div>
          <div style={getNavItemStyle("/records")} onClick={() => navigate("/records")}><FileText size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Records"}</div>
          {/* NEW BILLING NAV ITEM */}
          <div style={getNavItemStyle("/billings")} onClick={() => navigate("/billings")}><CreditCard size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Billings"}</div>
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "10px" }}>
          <div style={getNavItemStyle("/settings")} onClick={() => navigate("/settings")}><Settings size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Settings"}</div>
          <div style={{ ...getNavItemStyle("/logout"), color: "#ff4d4d" }} onClick={handleLogout}><LogOut size={20} style={{ flexShrink: 0 }} /> {!isCollapsed && "Logout"}</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, transition: "margin-left 0.3s ease" }}>
        <div style={{ padding: "60px 80px" }}>
          {/* UPDATED HEADER: Now uses userData.firstName */}
          <h1 style={{ color: "#001166", fontSize: "48px", fontWeight: "800", marginBottom: "10px" }}>{userData.firstName}'s Billing</h1>
          <p style={{ color: "#001166", fontWeight: "600", marginBottom: "40px" }}>Manage your payments and transaction history.</p>

          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
            <div style={{ backgroundColor: "#fff3cd", padding: "30px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "20px", border: "1px solid #ffe69c" }}>
              <div style={{ backgroundColor: "#ffc107", padding: "15px", borderRadius: "50%" }}>
                <DollarSign size={30} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, color: "#856404", fontWeight: "600", fontSize: "14px" }}>Total Outstanding Balance</p>
                <h2 style={{ margin: "5px 0 0 0", color: "#856404", fontSize: "32px", fontWeight: "800" }}>₱{totalOutstanding.toLocaleString()}</h2>
              </div>
            </div>

            <div style={{ backgroundColor: "#d1e7dd", padding: "30px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "20px", border: "1px solid #badbcc" }}>
              <div style={{ backgroundColor: "#198754", padding: "15px", borderRadius: "50%" }}>
                <Receipt size={30} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, color: "#0f5132", fontWeight: "600", fontSize: "14px" }}>Total Amount Paid</p>
                <h2 style={{ margin: "5px 0 0 0", color: "#0f5132", fontSize: "32px", fontWeight: "800" }}>₱{totalPaid.toLocaleString()}</h2>
              </div>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
            <button
              onClick={() => setActiveTab("pending")}
              style={{
                padding: "12px 30px", borderRadius: "30px", border: "none", fontWeight: "700", cursor: "pointer", transition: "all 0.3s",
                backgroundColor: activeTab === "pending" ? "#001166" : "#e8ebf5",
                color: activeTab === "pending" ? "white" : "#001166"
              }}>
              Pending Transactions
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                padding: "12px 30px", borderRadius: "30px", border: "none", fontWeight: "700", cursor: "pointer", transition: "all 0.3s",
                backgroundColor: activeTab === "history" ? "#001166" : "#e8ebf5",
                color: activeTab === "history" ? "white" : "#001166"
              }}>
              Payment Records
            </button>
          </div>

          {/* Data Table */}
          <div style={{ backgroundColor: "#e8ebf5", borderRadius: "30px", padding: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr", padding: "0 20px 15px 20px", color: "#001166", fontWeight: "800", borderBottom: "2px dashed #001166", marginBottom: "20px" }}>
              <div>Ref No.</div>
              <div>Date</div>
              <div>Service Description</div>
              <div>Amount</div>
              <div style={{ textAlign: "center" }}>Status</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(activeTab === "pending" ? pendingTransactions : completedTransactions).length > 0 ? (
                (activeTab === "pending" ? pendingTransactions : completedTransactions).map((item) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr 1fr", backgroundColor: "white", padding: "22px 20px", borderRadius: "15px", alignItems: "center" }}>
                    <div style={{ color: "#666", fontWeight: "700", fontSize: "14px" }}>{item.booking_ref}</div>
                    <div style={{ color: "#001166", fontWeight: "600" }}>{new Date(item.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div style={{ color: "#001166" }}>{item.service_type}</div>
                    <div style={{ color: activeTab === "pending" ? "#ff9800" : "#28a745", fontWeight: "800", fontSize: "16px" }}>
                      ₱{parseFloat(item.amount || 0).toLocaleString()}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{
                        padding: "6px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", color: "white",
                        backgroundColor: activeTab === "pending" ? "#ffc107" : "#10b981"
                      }}>
                        {activeTab === "pending" ? "Unpaid" : "Paid"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#001166" }}>
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