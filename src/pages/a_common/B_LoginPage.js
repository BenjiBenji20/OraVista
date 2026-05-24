import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, X, Square, CheckSquare } from 'lucide-react';

function LoginPage() {
  const [loginAs, setLoginAs] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State handles specific field errors, general errors are removed
  const [errors, setErrors] = useState({ email: '', password: '' });

  // --- FORGOT PASSWORD STATES ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpStep, setOtpStep] = useState("email");
  const [otpMessage, setOtpMessage] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // --- RESET PASSWORD STATES ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- FEEDBACK MODAL STATE ---
  const [feedbackModal, setFeedbackModal] = useState({ show: false, message: "", type: "error" });

  const [passwordCriteria, setPasswordCriteria] = useState({
    lower: false,
    upper: false,
    number: false,
    special: false,
    length: false
  });

  // --- REAL-TIME PASSWORD VALIDATION ---
  useEffect(() => {
    setPasswordCriteria({
      lower: /[a-z]/.test(newPassword),
      upper: /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      length: newPassword.length >= 8,
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // --- HELPER: SHOW FEEDBACK MODAL ---
  const showFeedback = (message, type = "error") => {
    setFeedbackModal({ show: true, message, type });
  };

  const closeFeedback = () => {
    setFeedbackModal({ ...feedbackModal, show: false });
    if (feedbackModal.type === "success" && feedbackModal.message.includes("updated")) {
      setShowResetModal(false);
      setForgotEmail("");
      setNewPassword("");
      setConfirmNewPassword("");
      setOtpStep("email");
    }
  };

  // --- FORGOT PASSWORD FUNCTIONS ---
  const sendOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setOtpMessage("Please enter your email.");
      return;
    }

    setIsOtpLoading(true);

    try {
      const response = await fetch("https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, action: "forgot_password" })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(data.generatedOtp);
        setOtpStep("verify");
        setOtpMessage("Code sent! Check your email.");
      } else {
        setOtpMessage(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setOtpMessage("Failed to process request. Ensure backend is running.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const verifyOTP = () => {
    if (otpInput === otpSent) {
      setShowForgotModal(false);
      setShowResetModal(true);
      setOtpMessage("");
      setOtpInput("");
    } else {
      setOtpMessage("Invalid code. Please try again.");
    }
  };

  const handlePasswordReset = async () => {
    if (!isPasswordValid) {
      showFeedback("Password does not meet all requirements.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showFeedback("Passwords do not match.", "error");
      return;
    }

    try {
      const response = await fetch("https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/reset-password-by-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword: newPassword }),
      });

      if (response.ok) {
        showFeedback("Password updated successfully! You can now login.", "success");
      } else {
        const data = await response.json();
        showFeedback(data.message || "Failed to update password.", "error");
      }
    } catch (error) {
      showFeedback("Server error. Check backend connection.", "error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    let currentErrors = { email: '', password: '' };
    let hasError = false;

    // Custom form validation
    if (!email.trim()) {
      currentErrors.email = 'Please provide your email address.';
      hasError = true;
    }
    if (!password) {
      currentErrors.password = 'Please provide your password.';
      hasError = true;
    }

    if (hasError) {
      setErrors(currentErrors);
      return;
    }

    setErrors({ email: '', password: '' });

    try {
      console.log("1. Sending login request...");
      const response = await fetch('https://oravista-server-temporary-756513026425.asia-southeast1.run.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("2. Server Response:", data);

      if (response.ok) {
        if (!data.user.role) {
          setErrors({ email: "Server Error: Missing role data.", password: '' });
          return;
        }

        const dbRole = data.user.role.toLowerCase();
        const selectedRole = loginAs.toLowerCase();

        console.log(`3. Checking Role: Database says '${dbRole}', You selected '${selectedRole}'`);

        if (dbRole === selectedRole) {
          localStorage.setItem('user', JSON.stringify(data.user));

          if (dbRole === 'admin') window.location.href = '/admin/dashboard';
          else if (dbRole === 'staff') window.location.href = '/staff/dashboard';
          else if (dbRole === 'dentist') window.location.href = '/dentist/dashboard';

        } else {
          // Role mismatch shown below the email
          setErrors({ email: `Access Denied: You are registered as '${dbRole}', not '${loginAs}'.`, password: '' });
        }
      } else {
        // Backend returns "Invalid email or password" -> show on both fields to indicate a mismatch
        setErrors({ email: data.message || 'Login failed.', password: data.message || 'Login failed.' });
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrors({ email: 'Server connection failed. Is port 5000 running?', password: '' });
    }
  };

  // --- MODAL STYLES ---
  const brandBlue = "#001166";
  const modalOverlayStyle = {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(5px)",
  };
  const modalContentStyle = {
    backgroundColor: "white", padding: "40px", borderRadius: "25px", textAlign: "center", maxWidth: "450px", width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", position: "relative"
  };
  const labelStyle = { display: "block", fontWeight: "700", fontSize: "14px", marginBottom: "8px", textAlign: "left", color: brandBlue };
  const inputStyle = (error) => ({
    width: "100%", padding: "12px 15px", borderRadius: "8px", border: error ? "2px solid red" : "1px solid #ddd",
    fontSize: "14px", boxSizing: "border-box", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", outline: "none", backgroundColor: "#fff",
  });

  const RequirementItem = ({ met, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: met ? "#28a745" : "#ff4d4d", marginBottom: "5px" }}>
      {met ? <CheckSquare size={16} /> : <Square size={16} />}
      <span>{label}</span>
    </div>
  );

  return (
    <div style={styles.container}>

      {/* FEEDBACK POPUP MODAL */}
      {feedbackModal.show && (
        <div style={{ ...modalOverlayStyle, zIndex: 3000 }}>
          <div style={{ ...modalContentStyle, padding: "30px", maxWidth: "350px" }}>
            <div style={{
              backgroundColor: feedbackModal.type === "success" ? "#e6f4ea" : "#fdecea",
              width: "60px", height: "60px", borderRadius: "50%",
              display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px"
            }}>
              {feedbackModal.type === "success" ? <CheckCircle2 size={32} color="#28a745" /> : <AlertCircle size={32} color="#ff4d4d" />}
            </div>
            <h3 style={{ color: brandBlue, fontWeight: "800", marginBottom: "10px", margin: 0 }}>
              {feedbackModal.type === "success" ? "Success!" : "Attention"}
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>{feedbackModal.message}</p>
            <button onClick={closeFeedback} style={{ width: "100%", padding: "12px", backgroundColor: brandBlue, color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
              Okay
            </button>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <X size={24} onClick={() => { setShowForgotModal(false); setOtpStep("email"); setOtpMessage(""); }} style={{ position: "absolute", right: "20px", top: "20px", cursor: "pointer", color: "#999" }} />
            <h2 style={{ color: brandBlue, fontWeight: "800", marginBottom: "10px", margin: 0 }}>Forgot Password?</h2>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              {otpStep === "email" ? "Enter your email to receive a verification code." : "Enter the code sent to your email."}
            </p>

            {otpStep === "email" ? (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ ...inputStyle(false), marginBottom: "15px" }}
                />
                <button onClick={sendOTP} disabled={isOtpLoading} style={{ width: "100%", padding: "12px", backgroundColor: brandBlue, color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", opacity: isOtpLoading ? 0.7 : 1 }}>
                  {isOtpLoading ? "Sending..." : "Send Code"}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{ ...inputStyle(false), marginBottom: "15px", letterSpacing: "5px", textAlign: "center", fontSize: "18px" }}
                  maxLength="6"
                />
                <button onClick={verifyOTP} style={{ width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                  Verify Code
                </button>
                <p onClick={() => setOtpStep("email")} style={{ marginTop: "15px", fontSize: "12px", color: brandBlue, cursor: "pointer", textDecoration: "underline" }}>
                  Resend Code
                </p>
              </>
            )}
            {otpMessage && <p style={{ color: otpMessage.includes("sent") ? "green" : "red", fontSize: "12px", marginTop: "10px", fontWeight: "600" }}>{otpMessage}</p>}
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <X size={24} onClick={() => setShowResetModal(false)} style={{ position: "absolute", right: "20px", top: "20px", cursor: "pointer", color: "#999" }} />
            <h2 style={{ color: brandBlue, fontWeight: "800", marginBottom: "20px", margin: 0 }}>Reset Password</h2>

            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle(false)}
                  placeholder="Enter new password"
                />
                <span onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: "absolute", right: "15px", top: "12px", cursor: "pointer", color: brandBlue }}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "20px", textAlign: "left" }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={inputStyle(false)}
                placeholder="Confirm new password"
              />
            </div>

            {/* REAL TIME CONDITIONS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left", marginBottom: "25px" }}>
              <RequirementItem met={passwordCriteria.lower} label="One lowercase" />
              <RequirementItem met={passwordCriteria.upper} label="One uppercase" />
              <RequirementItem met={passwordCriteria.number} label="One number" />
              <RequirementItem met={passwordCriteria.special} label="One special character" />
              <RequirementItem met={passwordCriteria.length} label="8 characters minimum" />
            </div>

            <button
              onClick={handlePasswordReset}
              style={{ width: "100%", padding: "12px", backgroundColor: brandBlue, color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", opacity: !isPasswordValid ? 0.7 : 1 }}
            >
              Change Password
            </button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.logoContainer}><div style={styles.logoCircle}></div></div>
        <h1 style={styles.title}>OraVista</h1>
        <p style={styles.subtitle}>System Login - King Epres Dental Clinic</p>

        {/* ROLE TABS */}
        <div style={styles.roleToggleContainer}>
          {['Admin', 'Staff', 'Dentist'].map((role) => (
            <button
              key={role}
              onClick={() => { setLoginAs(role); setErrors({ email: '', password: '' }); }}
              style={{
                ...styles.roleButton,
                backgroundColor: loginAs === role ? '#001166' : 'transparent',
                color: loginAs === role ? 'white' : '#666',
              }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <User size={20} style={styles.inputIcon} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@oravista.com" style={styles.input} />
            </div>
            {errors.email && <div style={styles.fieldErrorText}>{errors.email}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={20} style={styles.inputIcon} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="........" style={styles.input} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
              </button>
            </div>
            {errors.password && <div style={styles.fieldErrorText}>{errors.password}</div>}
          </div>

          <button type="submit" style={styles.loginButton}>Login</button>
        </form>
        <p
          style={styles.forgotPassword}
          onClick={() => setShowForgotModal(true)}
        >
          Forgot password?
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#001166', height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  card: { backgroundColor: 'white', width: '400px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  logoContainer: { width: '60px', height: '60px', backgroundColor: '#e0e0e0', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' },
  logoCircle: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#001166' },
  title: { color: '#001166', fontSize: '28px', fontWeight: '800', margin: '0 0 5px 0' },
  subtitle: { color: '#666', fontSize: '13px', fontWeight: '400', margin: '0 0 30px 0' },
  roleToggleContainer: { display: 'flex', backgroundColor: '#f0f2f5', borderRadius: '10px', padding: '5px', marginBottom: '20px', width: '100%' },
  roleButton: { flex: 1, padding: '10px 0', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' },
  form: { width: '100%' },
  inputGroup: { marginBottom: '20px', textAlign: 'left', width: '100%' },
  label: { display: 'block', color: '#001166', fontSize: '13px', fontWeight: '700', marginBottom: '8px', marginLeft: '5px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '15px', color: '#aaa', zIndex: 1 },
  eyeButton: { position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', zIndex: 2 },
  input: { width: '100%', padding: '12px 45px 12px 45px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '14px', color: '#333', backgroundColor: '#f9f9f9', outline: 'none', boxSizing: 'border-box' },
  fieldErrorText: { color: '#dc2626', fontSize: '12px', fontWeight: '600', marginTop: '5px', marginLeft: '5px' },
  loginButton: { width: '100%', padding: '12px', backgroundColor: '#001166', border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', marginBottom: '20px', transition: 'background-color 0.3s ease' },
  forgotPassword: { color: '#666', fontSize: '12px', cursor: 'pointer', margin: 0, textDecoration: 'underline' }
};

export default LoginPage;