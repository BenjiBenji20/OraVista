import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, LayoutDashboard, User, CalendarHeart, History, FileText, Settings, LogOut, AlertTriangle, CheckCircle2, RotateCw, ChevronLeft, ChevronRight
} from "lucide-react";

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState({ id: null, firstName: "User", branch: "" });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [bookingData, setBookingData] = useState({
    mainService: "",
    specificService: "",
    dentist: "",
    date: "",
    time: ""
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Dynamic Month Viewer Logic ---
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const currentMonthName = viewDate.toLocaleString('default', { month: 'long' });

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // --- Generate 3-Month Schedule ---
  const generateWeekdaySchedule = () => {
    const schedule = [];
    const startMonth = today.getMonth();

    for (let i = 0; i < 3; i++) {
      const targetDate = new Date(today.getFullYear(), startMonth + i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const daysInThisMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInThisMonth; day++) {
        const date = new Date(year, month, day);
        if (date >= new Date(today.setHours(0, 0, 0, 0))) {
          schedule.push(formatDate(date));
        }
      }
    }
    return schedule;
  };

  const mockSchedule = generateWeekdaySchedule();

  const servicesData = {
    "General Dentistry": [
      { name: "Oral Prophylaxis", price: 1500, duration: "(30 mins)" },
      { name: "Restoration", price: 1200, duration: "(1hr)" },
      { name: "Extraction", price: 1000, duration: "(1hr)" }
    ],
    "Orthodontics": [
      { name: "Braces Installation", price: 35000, duration: "(1hr)" },
      { name: "Braces Adjustment", price: 1000, duration: "(30 mins)" },
      { name: "Veneers", price: 15000, duration: "(2hrs)" }
    ],
    "Restorative Treatment": [
      { name: "Root Canal (RCT)", price: 8000, duration: "(2hrs)" },
      { name: "Wisdom Tooth Surgery", price: 10000, duration: "(3hrs)" },
      { name: "Dentures", price: 5000, duration: "(30 mins)" },
      { name: "Fixed Bridge", price: 12000, duration: "(2hrs)" },
      { name: "Teeth Whitening", price: 7000, duration: "(1hr 30mins)" }
    ]
  };

  // Actual Dentist Data categorized by Branch
  const branchDentists = {
    "Gil Puyat, Pasay": [
      { name: "Therese Madrid DMD", available: true, schedule: mockSchedule },
      { name: "Queenie Balmedina DMD", available: true, schedule: mockSchedule }
    ],
    "Sta. Ana, Manila": [
      { name: "Vicente Epress II Dmd", available: true, schedule: mockSchedule },
      { name: "Carl Adrian Usi DMD", available: true, schedule: mockSchedule },
      { name: "Queenie Balmedina DMD", available: true, schedule: mockSchedule }
    ],
    "Angeles, Pampanga": [
      { name: "Paulette Maliit DMD", available: true, schedule: mockSchedule }
    ]
  };

  // Filter dentists based on user's branch
  const filteredDentists = branchDentists[userData.branch] || [];

  const generateTimeSlots = (service, selectedDate) => {
    if (!selectedDate) return [];
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay();
    const slots = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];
    if (dayOfWeek === 0) slots.push("05:00 PM");
    return slots;
  };

  const loadUser = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData({
        id: user.id,
        firstName: user.firstName || "User",
        branch: user.branch || ""
      });
    }
  }, []);

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${modifier}`;
  };

  // UPDATED: Finds the duration safely across new objects and old database records
  const getDurationFromService = (serviceName) => {
    if (!serviceName) return 30;

    // Check new object structure first
    for (const key in servicesData) {
      const svc = servicesData[key].find(s => s.name === serviceName || `${s.name} ${s.duration}` === serviceName);
      if (svc) {
        // Strip out parenthesis so parseFloat can read the number correctly
        const text = svc.duration.toLowerCase().replace(/[()]/g, '');
        if (text.includes('hr') && text.includes('30mins')) return 90;
        if (text.includes('hr')) return parseFloat(text) * 60;
        if (text.includes('min')) return parseFloat(text);
      }
    }

    // Fallback for old database strings
    const durationMatch = serviceName.match(/\(([^)]+)\)/);
    if (!durationMatch) return 30;
    const text = durationMatch[1].toLowerCase();
    if (text.includes('hr') && text.includes('30mins')) return 90;
    if (text.includes('hr')) return parseFloat(text) * 60;
    if (text.includes('min')) return parseFloat(text);
    return 30;
  };

  // NEW: Find price for the currently selected service
  const getSelectedServicePrice = () => {
    if (!bookingData.mainService || !bookingData.specificService) return 0;
    const svc = servicesData[bookingData.mainService].find(s => s.name === bookingData.specificService);
    return svc ? svc.price : 0;
  };

  const selectedServicePrice = getSelectedServicePrice();

  const fetchBookedSlots = useCallback(async () => {
    if (!bookingData.date || !bookingData.dentist) return;
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/check-availability?date=${bookingData.date}&dentist=${encodeURIComponent(bookingData.dentist)}`
      );
      const data = await response.json();
      const allOccupiedMinutes = [];
      data.forEach(app => {
        const start = timeToMinutes(app.time);
        const duration = getDurationFromService(app.service);
        for (let i = 0; i < duration; i += 30) {
          allOccupiedMinutes.push(start + i);
        }
      });
      setBookedSlots(allOccupiedMinutes);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.date, bookingData.dentist]);

  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => { fetchBookedSlots(); }, [fetchBookedSlots]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleDiscard = () => {
    setBookingData({ mainService: "", specificService: "", dentist: "", date: "", time: "" });
  };

  const handleFinalSubmit = async () => {
    const appointmentData = {
      user_id: userData.id,
      service_type: bookingData.specificService,
      dentist_name: bookingData.dentist,
      appointment_date: bookingData.date,
      appointment_time: bookingData.time,
      amount: selectedServicePrice // NEW: Attach price to backend request
    };

    try {
      const response = await fetch("http://localhost:5000/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        handleDiscard();
        fetchBookedSlots();
      }
    } catch (error) {
      console.error("Connection Error:", error);
    }
  };

  const sidebarWidth = isCollapsed ? "80px" : "260px";
  const getNavItemStyle = (path) => ({
    display: "flex", alignItems: "center", gap: "15px", color: "white", textDecoration: "none",
    padding: "12px 15px", margin: "5px 0", fontSize: "16px", cursor: "pointer", borderRadius: "10px",
    transition: "all 0.3s ease", whiteSpace: "normal",
    backgroundColor: location.pathname === path ? "rgba(255, 255, 255, 0.2)" : "transparent",
    fontWeight: location.pathname === path ? "700" : "400",
    borderLeft: location.pathname === path ? "4px solid white" : "4px solid transparent",
  });

  const currentDentist = filteredDentists.find(d => d.name === bookingData.dentist);
  const timeSlots = generateTimeSlots(bookingData.specificService, bookingData.date);

  const selectedDuration = bookingData.specificService ? getDurationFromService(bookingData.specificService) : 0;
  const startTimeMins = timeToMinutes(bookingData.time);
  const endTimeStr = minutesToTime(startTimeMins + selectedDuration);

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
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
          <div style={getNavItemStyle("/settings")} onClick={() => navigate("/settings")}><Settings size={20} /> {!isCollapsed && "Settings"}</div>
          <div style={{ ...getNavItemStyle("/logout"), color: "#ff4d4d" }} onClick={handleLogout}><LogOut size={20} /> {!isCollapsed && "Logout"}</div>
        </div>
      </div>

      <div style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})`, transition: "margin-left 0.3s ease", backgroundColor: "white" }}>
        <div style={{ padding: "40px" }}>
          <h1 style={{ color: "#001166", fontSize: "42px", fontWeight: "800", margin: 0 }}>Book Now</h1>
          <p style={{ color: "#001166", fontWeight: "600", marginTop: "10px" }}>Welcome, {userData.firstName}! ({userData.branch || "Branch not set"})</p>

          <div style={{ backgroundColor: "#e8ebf5", borderRadius: "40px", padding: "50px", marginTop: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "30px", marginBottom: "40px" }}>
              <div>
                <label style={{ color: "#001166", fontWeight: "700", marginBottom: "10px", display: "block" }}>Services</label>
                <select style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }} value={bookingData.mainService} onChange={(e) => setBookingData({ ...bookingData, mainService: e.target.value, specificService: "" })}>
                  <option value="">Select Service</option>
                  {Object.keys(servicesData).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ color: "#001166", fontWeight: "700", marginBottom: "10px", display: "block" }}>Available Dentist</label>
                <select style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }} value={bookingData.dentist} onChange={(e) => setBookingData({ ...bookingData, dentist: e.target.value, date: "", time: "" })}>
                  <option value="">Select Dentist</option>
                  {filteredDentists.length > 0 ? (
                    filteredDentists.map(d => <option key={d.name} value={d.name} disabled={!d.available}>{d.name}</option>)
                  ) : (
                    <option disabled>No dentists for your branch</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ color: "#001166", fontWeight: "700", marginBottom: "10px", display: "block" }}>Available Slot</label>
                <select style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }} value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: "" })} disabled={!bookingData.dentist}>
                  <option value="">Select Date</option>
                  {currentDentist?.schedule.map(date => <option key={date} value={date}>{date}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "30px" }}>
              <div>
                <label style={{ color: "#001166", fontWeight: "700", marginBottom: "10px", display: "block" }}>Choose Type</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {bookingData.mainService && servicesData[bookingData.mainService].map(type => (
                    <button key={type.name} onClick={() => setBookingData({ ...bookingData, specificService: type.name })}
                      style={{
                        padding: "15px", borderRadius: "12px", border: "none", textAlign: "left", cursor: "pointer", fontWeight: "600",
                        backgroundColor: bookingData.specificService === type.name ? "#001166" : "#f0f2f8",
                        color: bookingData.specificService === type.name ? "white" : "#001166",
                        display: "flex", justifyContent: "space-between"
                      }}>
                      <span>{type.name} {type.duration}</span>
                      <span>₱{type.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: "#001166", fontWeight: "700", marginBottom: "10px", display: "block" }}>Dentist Schedule</label>
                <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "15px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "#001166" }}><ChevronLeft size={18} /></button>
                    <p style={{ fontWeight: "800", textAlign: "center", margin: 0, fontSize: "14px" }}>{currentMonthName} {currentYear}</p>
                    <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "#001166" }}><ChevronRight size={18} /></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center" }}>
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ fontWeight: "700", fontSize: "11px", paddingBottom: "5px" }}>{d}</div>)}
                    {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`}></div>)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const currentDayDate = new Date(currentYear, currentMonth, i + 1);
                      const dayStr = formatDate(currentDayDate);
                      const isAvailable = currentDentist?.schedule.includes(dayStr);
                      const isSelected = bookingData.date === dayStr;
                      return (
                        <div key={i} onClick={() => isAvailable && setBookingData({ ...bookingData, date: dayStr, time: "" })}
                          style={{
                            padding: "8px 0", borderRadius: "6px", fontSize: "12px", cursor: isAvailable ? "pointer" : "default",
                            backgroundColor: isSelected ? "#001166" : (isAvailable ? "#e8ebf5" : "transparent"),
                            color: isSelected ? "white" : (isAvailable ? "#001166" : "#ccc")
                          }}>
                          {i + 1}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ color: "#001166", fontWeight: "700", margin: 0 }}>Choose Time</label>
                  <button onClick={fetchBookedSlots} disabled={!bookingData.date || !bookingData.dentist || isRefreshing}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "#001166", fontSize: "12px", fontWeight: "600" }}>
                    <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {bookingData.date ? timeSlots.map(t => {
                    const currentMinutes = timeToMinutes(t);
                    const isTaken = bookedSlots.includes(currentMinutes);
                    return (
                      <button key={t} onClick={() => !isTaken && setBookingData({ ...bookingData, time: t })}
                        disabled={isTaken}
                        style={{
                          padding: "12px", borderRadius: "10px", border: "none", fontWeight: "600",
                          cursor: isTaken ? "not-allowed" : "pointer",
                          backgroundColor: isTaken ? "#ccc" : (bookingData.time === t ? "#001166" : "white"),
                          color: isTaken ? "#888" : (bookingData.time === t ? "white" : "#001166"),
                          opacity: isTaken ? 0.6 : 1
                        }}>
                        {t} {isTaken && "(Occupied)"}
                      </button>
                    );
                  }) : <p style={{ fontSize: "12px", color: "#666" }}>Please select a date first.</p>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginTop: "40px" }}>
              <button onClick={handleDiscard} style={{ padding: "12px 30px", borderRadius: "10px", border: "none", backgroundColor: "#ff4d4d", color: "white", fontWeight: "700", cursor: "pointer" }}>Cancel Booking</button>
              <button onClick={() => setShowConfirmModal(true)} disabled={!bookingData.time}
                style={{ padding: "12px 30px", borderRadius: "10px", border: "none", backgroundColor: "#28a745", color: "white", fontWeight: "700", cursor: "pointer", opacity: !bookingData.time ? 0.6 : 1 }}>
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "400px" }}>
            <AlertTriangle size={50} color="#001166" style={{ marginBottom: "15px", margin: "0 auto" }} />
            <h3 style={{ color: "#001166", fontWeight: "800", marginBottom: "5px" }}>Confirm Appointment?</h3>
            <div style={{ borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "15px 0", margin: "15px 0", textAlign: "left" }}>
              <p style={{ fontSize: "14px", margin: "5px 0" }}><strong>Service:</strong> {bookingData.specificService}</p>
              <p style={{ fontSize: "14px", margin: "5px 0" }}><strong>Dentist:</strong> {bookingData.dentist}</p>
              <p style={{ fontSize: "14px", margin: "5px 0" }}><strong>Date:</strong> {bookingData.date}</p>
              <p style={{ fontSize: "14px", margin: "5px 0" }}><strong>Time:</strong> {bookingData.time} - {endTimeStr}</p>
              <p style={{ fontSize: "15px", margin: "10px 0 0 0", color: "#28a745", fontWeight: "800" }}><strong>Base Price:</strong> ₱{selectedServicePrice.toLocaleString()}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ccc", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleFinalSubmit} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer" }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2100 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "400px" }}>
            <CheckCircle2 size={50} color="#28a745" style={{ marginBottom: "15px", margin: "0 auto" }} />
            <h3 style={{ color: "#001166", fontWeight: "800" }}>Appointment Booked!</h3>
            <button onClick={() => setShowSuccessModal(false)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#001166", color: "white", cursor: "pointer", marginTop: "15px" }}>Close</button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}

export default BookingPage;