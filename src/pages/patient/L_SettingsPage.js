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
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Smartphone
} from "lucide-react";

function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState({ firstName: "User", email: "" });

  // --- MODAL VISIBILITY STATES ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // --- OTP MODAL STATES ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // --- FORM DATA STATES ---
  const [passwords, setPasswords] = useState({ old: "", next: "", confirm: "" });
  const [showPass, setShowPass] = useState({ old: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});

  // --- PREFERENCE STATES ---
  const [preferences, setPreferences] = useState({
    language: localStorage.getItem("language") || "English",
    timezone: localStorage.getItem("timezone") || "Asia/Manila",
  });

  // --- NOTIFICATION TOGGLE STATES ---
  const [notifSettings, setNotifSettings] = useState({
    reminders: true,
    promos: false,
    alerts: true
  });

  const loadUser = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData({
        firstName: user.firstName || "User",
        email: user.email || "",
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNotif = (key) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = () => {
    localStorage.setItem("language", preferences.language);
    localStorage.setItem("timezone", preferences.timezone);
    setShowPreferenceModal(false);
    setShowSuccessModal(true);
  };

  const saveNotifications = () => {
    setShowNotifModal(false);
    setShowSuccessModal(true);
  };

  const handleSaveAttempt = () => {
    const val = passwords.next;
    const hasMinLength = val.length >= 8;
    const hasUppercase = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
    const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;

    let newErrors = {};
    if (!passwords.old) newErrors.old = "Old password is required.";
    if (!isValid) newErrors.next = "Password does not meet all requirements.";
    if (passwords.next !== passwords.confirm) newErrors.confirm = "Passwords do not match.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setShowConfirmModal(true);
    }
  };

  const sendOTP = async () => {
    setIsOtpLoading(true);
    setOtpMessage("");
    try {
      const response = await fetch("https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email, action: "change_password" }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(data.generatedOtp);
        setShowConfirmModal(false);
        setShowPasswordModal(false);
        setShowOtpModal(true);
        setOtpMessage("Code sent! Check your email.");
      } else {
        setOtpMessage(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      setOtpMessage("Failed to process request. Ensure backend is running.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otpInput === otpSent) {
      setShowOtpModal(false);
      setShowSuccessModal(true);
      setOtpInput("");
      setOtpMessage("");
      setPasswords({ old: "", next: "", confirm: "" });
    } else {
      setOtpMessage("Invalid code. Please try again.");
    }
  };

  const handleFinalSubmit = () => {
    sendOTP();
  };

  // --- REUSABLE UI COMPONENTS ---
  const ToggleSwitch = ({ label, description, isOn, onToggle }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #eee" }}>
      <div style={{ textAlign: "left", flex: 1, paddingRight: "20px" }}>
        <h4 style={{ margin: "0 0 5px 0", color: "#001166", fontSize: "16px" }}>{label}</h4>
        <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{description}</p>
      </div>
      <div
        onClick={onToggle}
        style={{ width: "50px", height: "26px", backgroundColor: isOn ? "#28a745" : "#ccc", borderRadius: "15px", position: "relative", cursor: "pointer", transition: "background-color 0.3s" }}
      >
        <div style={{ width: "22px", height: "22px", backgroundColor: "white", borderRadius: "50%", position: "absolute", top: "2px", left: isOn ? "26px" : "2px", transition: "left 0.3s", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );

  const sidebarWidth = isCollapsed ? "80px" : "260px";
  const getNavItemStyle = (path) => ({
    display: "flex", alignItems: "center", gap: "15px", color: "white", textDecoration: "none", padding: "12px 15px", margin: "5px 0", fontSize: "16px", cursor: "pointer", borderRadius: "10px", transition: "all 0.3s ease", whiteSpace: "normal", backgroundColor: location.pathname === path ? "rgba(255, 255, 255, 0.2)" : "transparent", fontWeight: location.pathname === path ? "700" : "400", borderLeft: location.pathname === path ? "4px solid white" : "4px solid transparent",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>

      {/* ----------------- MODALS ----------------- */}

      {/* MODAL: PRIVACY & SECURITY */}
      {showPrivacyModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(5px)" }}>
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "25px", width: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
              <ShieldCheck size={32} color="#001166" />
              <h2 style={{ color: "#001166", fontWeight: "800", margin: 0 }}>Privacy & Security</h2>
            </div>

            <div style={{ backgroundColor: "#e6f4ea", padding: "20px", borderRadius: "15px", display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
              <CheckCircle2 size={24} color="#28a745" />
              <div>
                <h4 style={{ margin: "0 0 5px 0", color: "#155724" }}>Two-Factor Authentication</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#28a745" }}>Email Verification (OTP) is Active</p>
              </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ color: "#001166", marginBottom: "15px", borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Recent Logins</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", padding: "10px 0" }}>
                <div style={{ backgroundColor: "#f0f2f5", padding: "10px", borderRadius: "10px" }}><Smartphone size={20} color="#666" /></div>
                <div>
                  <p style={{ margin: "0 0 3px 0", fontWeight: "700", fontSize: "14px", color: "#333" }}>Windows Desktop (Current)</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>IP: 192.168.1.45 • Manila, PH</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowPrivacyModal(false)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer", fontWeight: "600" }}>Close</button>
          </div>
        </div>
      )}

      {/* MODAL: NOTIFICATIONS */}
      {showNotifModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(5px)" }}>
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "25px", width: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#001166", fontWeight: "800", marginTop: 0, marginBottom: "25px" }}>Notifications</h2>

            <div style={{ marginBottom: "30px" }}>
              <ToggleSwitch
                label="Appointment Reminders"
                description="Receive emails 24 hours before your scheduled visit."
                isOn={notifSettings.reminders}
                onToggle={() => toggleNotif('reminders')}
              />
              <ToggleSwitch
                label="Marketing & Promos"
                description="Get updates on dental discounts and clinic news."
                isOn={notifSettings.promos}
                onToggle={() => toggleNotif('promos')}
              />
              <ToggleSwitch
                label="System Alerts"
                description="Security notifications, login alerts, and system updates."
                isOn={notifSettings.alerts}
                onToggle={() => toggleNotif('alerts')}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowNotifModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
              <button onClick={saveNotifications} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer", fontWeight: "600" }}>Save Preferences</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREFERENCE */}
      {showPreferenceModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(5px)" }}>
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "25px", width: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#001166", fontWeight: "800", marginTop: 0, marginBottom: "25px" }}>Preferences</h2>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#001166", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Language</label>
              <select name="language" value={preferences.language} onChange={handlePreferenceChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc", outline: "none", fontSize: "14px" }}>
                <option value="English">English</option>
                <option value="Tagalog">Tagalog</option>
              </select>
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", color: "#001166", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Timezone</label>
              <select name="timezone" value={preferences.timezone} onChange={handlePreferenceChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc", outline: "none", fontSize: "14px" }}>
                <option value="Asia/Manila">Asia/Manila (PHT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowPreferenceModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", backgroundColor: "white", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
              <button onClick={savePreferences} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer", fontWeight: "600" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {showPasswordModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(5px)" }}>
          <div style={{ backgroundColor: "#001166", padding: "50px", borderRadius: "35px", width: "850px" }}>
            <h2 style={{ color: "white", fontSize: "32px", fontWeight: "800", marginBottom: "35px" }}>Change Password</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              <div style={{ position: "relative", width: "48%" }}>
                <label style={{ color: "white", marginBottom: "8px", display: "block", fontSize: "14px", fontWeight: "600" }}>Old Password</label>
                <input type={showPass.old ? "text" : "password"} name="old" value={passwords.old} onChange={handleInputChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", outline: "none" }} />
                <div onClick={() => setShowPass({ ...showPass, old: !showPass.old })} style={{ position: "absolute", right: "12px", top: "38px", cursor: "pointer", color: "#666" }}>
                  {showPass.old ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
                {errors.old && <p style={{ color: "#ff4d4d", fontSize: "12px", marginTop: "5px" }}>{errors.old}</p>}
              </div>

              <div style={{ display: "flex", gap: "30px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <label style={{ color: "white", marginBottom: "8px", display: "block", fontSize: "14px", fontWeight: "600" }}>New Password</label>
                  <input type={showPass.next ? "text" : "password"} name="next" value={passwords.next} onChange={handleInputChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", outline: "none" }} />
                  <div onClick={() => setShowPass({ ...showPass, next: !showPass.next })} style={{ position: "absolute", right: "12px", top: "38px", cursor: "pointer", color: "#666" }}>
                    {showPass.next ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                  <p style={{ color: "white", fontSize: "11px", marginTop: "8px", opacity: 0.8 }}>Must be at least 8 characters, include 1 uppercase, 1 number, and 1 special character.</p>
                  {errors.next && <p style={{ color: "#ff4d4d", fontSize: "12px", marginTop: "5px" }}>{errors.next}</p>}
                </div>

                <div style={{ position: "relative", flex: 1 }}>
                  <label style={{ color: "white", marginBottom: "8px", display: "block", fontSize: "14px", fontWeight: "600" }}>Confirm New Password</label>
                  <input type={showPass.confirm ? "text" : "password"} name="confirm" value={passwords.confirm} onChange={handleInputChange} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", outline: "none" }} />
                  <div onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })} style={{ position: "absolute", right: "12px", top: "38px", cursor: "pointer", color: "#666" }}>
                    {showPass.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                  {errors.confirm && <p style={{ color: "#ff4d4d", fontSize: "12px", marginTop: "5px" }}>{errors.confirm}</p>}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "10px" }}>
                <button onClick={() => setShowPasswordModal(false)} style={{ padding: "12px 45px", borderRadius: "25px", border: "none", backgroundColor: "#ff4d4d", color: "white", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSaveAttempt} style={{ padding: "12px 45px", borderRadius: "25px", border: "none", backgroundColor: "#4ade80", color: "white", fontWeight: "700", cursor: "pointer" }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMATION */}
      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2100 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "400px" }}>
            <AlertTriangle size={50} color="#001166" style={{ margin: "0 auto 15px" }} />
            <h3 style={{ color: "#001166", fontWeight: "800" }}>Confirm Changes?</h3>
            <p style={{ fontSize: "14px", color: "#666" }}>Are you sure you want to update your password?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", cursor: "pointer" }} disabled={isOtpLoading}>Cancel</button>
              <button onClick={handleFinalSubmit} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer", fontWeight: "600", opacity: isOtpLoading ? 0.7 : 1 }} disabled={isOtpLoading}>
                {isOtpLoading ? "Sending OTP..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OTP VERIFICATION */}
      {showOtpModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2150, backdropFilter: "blur(5px)" }}>
          <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "25px", textAlign: "center", width: "400px" }}>
            <h2 style={{ color: "#001166", fontWeight: "800", marginBottom: "10px" }}>Verification Required</h2>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Enter the 6-digit code sent to <strong>{userData.email}</strong> to finalize your password change.</p>
            <input type="text" placeholder="Enter 6-digit code" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} style={{ width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "15px", letterSpacing: "5px", textAlign: "center", fontSize: "18px", outline: "none", boxSizing: "border-box" }} maxLength="6" />
            <button onClick={verifyOTP} style={{ width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>Verify Code</button>
            <p onClick={sendOTP} style={{ marginTop: "15px", fontSize: "12px", color: "#001166", cursor: "pointer", textDecoration: "underline" }}>Resend Code</p>
            {otpMessage && <p style={{ color: otpMessage.includes("sent") ? "green" : "red", fontSize: "12px", marginTop: "10px", fontWeight: "600" }}>{otpMessage}</p>}
            <button onClick={() => { setShowOtpModal(false); setOtpInput(""); setOtpMessage(""); }} style={{ marginTop: "15px", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Cancel Change</button>
          </div>
        </div>
      )}

      {/* MODAL: SUCCESS */}
      {showSuccessModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2200 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "400px" }}>
            <CheckCircle2 size={50} color="#3ddb73" style={{ margin: "0 auto 15px" }} />
            <h3 style={{ color: "#001166", fontWeight: "800" }}>Action Successful!</h3>
            <button onClick={() => setShowSuccessModal(false)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer", marginTop: "15px" }}>Close</button>
          </div>
        </div>
      )}

      {/* ----------------- SIDEBAR ----------------- */}
      <div style={{ width: sidebarWidth, backgroundColor: "#001166", height: "100vh", color: "white", padding: "20px 15px", position: "fixed", transition: "width 0.3s ease", zIndex: 1000, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          {!isCollapsed && <h2 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>OraVista</h2>}
          <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: "pointer" }}>{isCollapsed ? <Menu size={24} /> : <X size={24} />}</div>
        </div>
        <nav style={{ flexGrow: 1 }}>
          <div style={getNavItemStyle("/dashboard")} onClick={() => navigate("/dashboard")}><LayoutDashboard size={20} /> {!isCollapsed && "Dashboard"}</div>
          <div style={getNavItemStyle("/profile")} onClick={() => navigate("/profile")}><User size={20} /> {!isCollapsed && "Profile"}</div>
          <div style={getNavItemStyle("/booking")} onClick={() => navigate("/booking")}><CalendarHeart size={20} /> {!isCollapsed && "Book an Appointment"}</div>
          <div style={getNavItemStyle("/appointments")} onClick={() => navigate("/appointments")}><History size={20} /> {!isCollapsed && "My Appointments"}</div>
          <div style={getNavItemStyle("/records")} onClick={() => navigate("/records")}><FileText size={20} /> {!isCollapsed && "Records"}</div>
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "10px" }}>
          <div style={getNavItemStyle("/settings")} onClick={() => navigate("/settings")}><SettingsIcon size={20} /> {!isCollapsed && "Settings"}</div>
          <div style={{ ...getNavItemStyle("/logout"), color: "#ff4d4d" }} onClick={handleLogout}><LogOut size={20} /> {!isCollapsed && "Logout"}</div>
        </div>
      </div>

      {/* ----------------- MAIN CONTENT AREA ----------------- */}
      <div style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, transition: "margin-left 0.3s ease" }}>
        <div style={{ padding: "60px 80px", maxWidth: "1200px" }}>
          <h1 style={{ color: "#001166", fontSize: "48px", fontWeight: "800", marginBottom: "50px" }}>Settings</h1>

          {["Change Password", "Privacy & Security", "Notifications", "Preference"].map((label) => (
            <div
              key={label}
              onClick={() => {
                if (label === "Change Password") setShowPasswordModal(true);
                if (label === "Preference") setShowPreferenceModal(true);
                if (label === "Privacy & Security") setShowPrivacyModal(true);
                if (label === "Notifications") setShowNotifModal(true);
              }}
              style={{ backgroundColor: "#e8ebf5", borderRadius: "20px", padding: "30px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", cursor: "pointer" }}
            >
              <h3 style={{ color: "#001166", fontSize: "24px", fontWeight: "800", margin: 0 }}>{label}</h3>
              <ChevronRight size={32} color="#001166" />
            </div>
          ))}
          <p style={{ color: "#666", marginTop: "40px" }}>Signed in as: {userData.firstName} ({userData.email})</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;