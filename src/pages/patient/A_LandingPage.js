import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, ShieldCheck } from "lucide-react";
import landingBg from "../../assets/BG_IMG.png";
import playIcon from "../../assets/gpslogo.png";
import serviceImage from '../../assets/dentimage.jpg'; 

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("Select Branch");
  const navigate = useNavigate(); 

  // --- SCROLL REFERENCES ---
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (elementRef) => {
    window.scrollTo({
      top: elementRef.current.offsetTop - 80, // Offset for the sticky navbar
      behavior: "smooth",
    });
  };

  const branches = [
    "Gil Puyat, Pasay",
    "Sta. Ana, Manila",
    "Angeles, Pampanga",
  ];

  const handleSelect = (branch) => {
    setSelectedBranch(branch);
    setIsOpen(false);
    localStorage.setItem("tempBranch", branch);
    setTimeout(() => {
      navigate("/login");
    }, 300);
  };

  // --- UPDATED: Management Portal Navigation Handler[cite: 8] ---
  const handlePortalClick = () => {
    console.log("Navigating to Management Portal...");
    // This route should match the path for A_LandingPage_4.js in your App.js[cite: 8]
    navigate("/management"); 
  };

  // ==========================================
  // STYLES: HERO / NAVBAR 
  // ==========================================
  const brandBlue = "#001166";

  const heroSectionStyle = {
    backgroundImage: `url(${landingBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: "8%",
    boxSizing: "border-box",
  };

  const navLinkStyle = {
    cursor: "pointer",
    fontWeight: "600",
    color: brandBlue,
    fontSize: "15px",
    transition: "color 0.2s"
  };

  const portalBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: brandBlue,
    color: "white",
    border: "none",
    padding: "8px 18px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.2s, background-color 0.2s",
    fontFamily: "'Poppins', sans-serif"
  };

  // ==========================================
  // STYLES: ABOUT US
  // ==========================================
  const aboutStyles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px', fontFamily: "'Poppins', sans-serif", color: '#001166' },
    topSection: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '50px', marginBottom: '40px' },
    textContent: { flex: 1 },
    header: { fontSize: '42px', fontWeight: '900', marginBottom: '25px', marginTop: 0, color: '#001166' },
    paragraph: { fontSize: '16px', lineHeight: '1.7', color: '#333', marginBottom: '20px', maxWidth: '550px' },
    imageContainer: { flex: 1.2 },
    image: { width: '100%', height: '500px', borderRadius: '8px', objectFit: 'cover', marginTop: '25px', display: 'block', marginLeft: 'auto' },
    whyChooseSection: { marginTop: '40px', marginBottom: '60px' },
    whyChooseHeaderContainer: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' },
    blueLine: { flex: 1, height: '3px', backgroundColor: '#001166', marginTop: '10px' },
    bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '50px', alignItems: 'center' },
    ratingsCard: { backgroundColor: '#001166', color: 'white', padding: '45px', borderRadius: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '30px' },
    ratingsLabel: { fontSize: '48px', fontWeight: '900', margin: 0 },
    starsContainer: { textAlign: 'left' },
    stars: { color: '#FFD700', fontSize: '20px', marginBottom: '5px' },
    reviewsSection: { display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '20px' },
    reviewTitle: { fontWeight: '800', fontSize: '18px', marginBottom: '5px', color: '#000' },
    quote: { fontStyle: 'normal', color: '#333', fontSize: '15px', margin: 0, lineHeight: '1.6' }
  };

  // ==========================================
  // STYLES: SERVICES
  // ==========================================
  const servicesStyles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px', fontFamily: "'Poppins', sans-serif", textAlign: 'center' },
    headerSection: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '15px' },
    blueLine: { flex: 1, height: '3px', backgroundColor: '#001166' },
    title: { fontSize: '42px', fontWeight: '900', color: '#001166', margin: 0, whiteSpace: 'nowrap' },
    subtitle: { fontSize: '18px', color: '#333', marginBottom: '60px', fontWeight: '500' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '80px' },
    serviceCard: { backgroundColor: '#001166', borderRadius: '25px', padding: '60px 30px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', boxShadow: '0 10px 25px rgba(0, 17, 102, 0.1)' },
    cardTitle: { fontSize: '32px', fontWeight: '800', marginBottom: '40px', lineHeight: '1.2' },
    cardDescription: { fontSize: '16px', lineHeight: '1.6', opacity: 0.9, maxWidth: '250px' },
    bookingBanner: { display: 'flex', backgroundColor: '#001166', borderRadius: '4px', overflow: 'hidden', textAlign: 'left', color: 'white', marginTop: '40px', alignItems: 'stretch' },
    bookingText: { flex: 1, padding: '50px' },
    bookingTitle: { fontSize: '22px', fontWeight: '800', marginBottom: '20px' },
    bookingPara: { fontSize: '14px', lineHeight: '1.6', marginBottom: '30px', opacity: 0.9 },
    stepsTitle: { fontSize: '16px', fontWeight: '800', marginBottom: '15px' },
    stepsList: { listStyleType: 'decimal', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' },
    bookBtn: { marginTop: '30px', backgroundColor: 'white', color: '#001166', border: 'none', padding: '12px 30px', borderRadius: '30px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '10px' },
    imageSection: { flex: 1, background: `url(${serviceImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '100%' }
  };

  // ==========================================
  // STYLES: CONTACT
  // ==========================================
  const contactStyles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px', fontFamily: "'Poppins', sans-serif", color: '#001166', textAlign: 'left' },
    header: { fontSize: '42px', fontWeight: '800', marginBottom: '40px' },
    grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr 2fr', gap: '50px', marginBottom: '60px' },
    sectionTitle: { fontSize: '22px', fontWeight: '800', marginBottom: '25px' },
    description: { fontSize: '15px', lineHeight: '1.6', color: '#333', marginBottom: '30px' },
    socialLinks: { display: 'flex', gap: '15px', marginTop: '20px' },
    linkList: { listStyle: 'none', padding: 0, margin: 0 },
    linkItem: { fontSize: '16px', marginBottom: '15px', cursor: 'pointer', color: '#001166', fontWeight: '500' },
    contactInfo: { display: 'flex', flexDirection: 'column', gap: '30px' },
    locationGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    locationTitle: { fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' },
    infoItem: { fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#333' },
    footerLine: { borderTop: '3px solid #001166', paddingTop: '20px', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#333' }
  };

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fafafa" }}>
      
      {/* ----------------- STICKY NAVBAR ----------------- */}
      <nav style={{ 
        position: "fixed", top: 0, left: 0, width: "100%", height: "80px", 
        backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)",
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "0 10%", boxShadow: "0 2px 15px rgba(0,0,0,0.05)", zIndex: 1000,
        boxSizing: "border-box", fontFamily: "'Poppins', sans-serif"
      }}>
        <h1 style={{ color: brandBlue, fontWeight: "800", fontSize: "28px", margin: 0, cursor: "pointer" }} onClick={() => scrollToSection(homeRef)}>
          OraVista
        </h1>
        
        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          <span style={navLinkStyle} onClick={() => scrollToSection(homeRef)}>Home</span>
          <span style={navLinkStyle} onClick={() => scrollToSection(aboutRef)}>About Us</span>
          <span style={navLinkStyle} onClick={() => scrollToSection(servicesRef)}>Services</span>
          <span style={navLinkStyle} onClick={() => scrollToSection(contactRef)}>Contact</span>
          {/* Portal Button to Management Side[cite: 8] */}
          <button 
            style={portalBtnStyle} 
            onClick={handlePortalClick}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0022cc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brandBlue)}
          >
            <ShieldCheck size={18} />
            Portal
          </button>
        </div>
      </nav>

      {/* ----------------- HOME / HERO SECTION ----------------- */}
      <div ref={homeRef} style={heroSectionStyle}>
        <h1 style={{ fontSize: "64px", fontWeight: "800", color: "#001166", marginBottom: "0px", lineHeight: "1.0", fontFamily: "'Poppins', sans-serif" }}>
          Welcome to King Epres Dental Clinic
        </h1>
        <p style={{ fontSize: "26px", color: "#001166", marginTop: "10px", marginBottom: "30px", whiteSpace: "nowrap", maxWidth: "none", fontFamily: "'Poppins', sans-serif" }}>
          Caring for your smile with professional and compassionate dental services.
        </p>

        <div style={{ position: "relative", display: "inline-block", fontFamily: "'Poppins', sans-serif" }}>
          <button 
            style={{ padding: "12px 24px", backgroundColor: "#001166", color: "white", border: "none", borderRadius: "8px", fontSize: "18px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px", minWidth: "220px", justifyContent: "space-between" }} 
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedBranch} <span>{isOpen ? "▲" : "▼"}</span>
          </button>

          {isOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, backgroundColor: "#001166", borderRadius: "8px", marginTop: "5px", width: "100%", overflow: "hidden", boxShadow: "0 8px 16px rgba(0,0,0,0.2)", zIndex: 10 }}>
              {branches.map((branch) => (
                <div
                  key={branch}
                  style={{ padding: "12px 20px", color: "white", cursor: "pointer", fontSize: "16px", fontFamily: "'Poppins', sans-serif", borderBottom: "1px solid rgba(255,255,255,0.1)", transition: "background 0.2s" }}
                  onClick={() => handleSelect(branch)}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#0022cc")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  {branch}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MOBILE PROMO */}
        <div style={{ marginTop: "60px", display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "30px", fontFamily: "'Poppins', sans-serif", maxWidth: "800px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "15px" }}>
            <p style={{ fontSize: "19px", color: "#001166", margin: 0, fontWeight: "600", lineHeight: "1.4" }}>
              Experience seamless dental care right at your fingertips. Download the OraVista mobile app to book appointments on the go, manage your personalized dental profile, and receive real-time updates on your clinic records.
            </p>
            <button 
              style={{ padding: "10px 20px", backgroundColor: "#001166", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "700", transition: "all 0.3s ease", width: "180px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxSizing: "border-box" }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = "#0022cc"; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = "#001166"; }}
            >
              <img src={playIcon} alt="Google Play Icon" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
              Google Play
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- ABOUT US SECTION ----------------- */}
      <section ref={aboutRef} style={{ width: '100%', paddingTop: '100px', paddingBottom: '60px', backgroundColor: 'white' }}>
        <div style={aboutStyles.container}>
          <div style={aboutStyles.topSection}>
            <div style={aboutStyles.textContent}>
              <h1 style={aboutStyles.header}>About Us</h1>
              <p style={aboutStyles.paragraph}>
                At King Epres Dental Clinic, we are dedicated to providing top-quality dental care in a comfortable and friendly environment.
              </p>
              <p style={aboutStyles.paragraph}>
                Our experienced team of dentists and staff are committed to ensuring your oral health and giving you a confident smile. From routine check-ups to advanced treatments, we use modern technology to deliver safe and effective dental services.
              </p>
            </div>
            <div style={aboutStyles.imageContainer}>
              <img 
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop" 
                alt="Dental Team" 
                style={aboutStyles.image} 
              />
            </div>
          </div>

          <div style={aboutStyles.whyChooseSection}>
            <div style={aboutStyles.whyChooseHeaderContainer}>
              <h2 style={{ ...aboutStyles.header, marginBottom: 0, fontSize: '38px' }}>Why Choose Us</h2>
              <div style={aboutStyles.blueLine}></div>
            </div>
            <p style={{...aboutStyles.paragraph, maxWidth: 'none'}}>
              King Epres Dental Clinic, combine expertise, technology, and care to give you the best dental experience possible. Our team of highly trained professionals ensures that every patient receives safe, effective, and personalized treatments. Using state-of-the-art equipment, we provide accurate diagnostics and modern dental solutions.
            </p>
            <p style={{...aboutStyles.paragraph, maxWidth: 'none'}}>
              We prioritize your comfort and satisfaction, offering a clean, welcoming environment and convenient scheduling options. With transparent pricing and a patient-centered approach, we aim to make quality dental care accessible, efficient, and stress-free.
            </p>
          </div>

          <div style={aboutStyles.bottomGrid}>
            <div style={aboutStyles.ratingsCard}>
              <h2 style={aboutStyles.ratingsLabel}>Ratings</h2>
              <div style={aboutStyles.starsContainer}>
                <div style={aboutStyles.stars}>★★★★★ <span style={{ color: 'white', fontSize: '18px', marginLeft: '5px' }}>4.9/5</span></div>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>(Based on 250+ reviews)</p>
              </div>
            </div>
            <div style={aboutStyles.reviewsSection}>
              <h3 style={aboutStyles.reviewTitle}>Recent Reviews:</h3>
              <p style={aboutStyles.quote}>
                "The staff made me feel at ease, and my treatment was quick and painless!" – Maria S.
              </p>
              <p style={aboutStyles.quote}>
                "Highly recommend! Their diagnostic tools are impressive, and the team is very professional." – John D.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SERVICES SECTION ----------------- */}
      <section ref={servicesRef} style={{ width: '100%', paddingTop: '100px', paddingBottom: '60px', backgroundColor: '#f9fafe' }}>
        <div style={servicesStyles.container}>
          <div style={servicesStyles.headerSection}>
            <div style={servicesStyles.blueLine}></div>
            <h1 style={servicesStyles.title}>Our Services</h1>
            <div style={servicesStyles.blueLine}></div>
          </div>
          
          <p style={servicesStyles.subtitle}>
            We offer a wide range of dental care to keep your smile healthy and beautiful
          </p>

          <div style={servicesStyles.servicesGrid}>
            <div style={servicesStyles.serviceCard}>
              <h2 style={servicesStyles.cardTitle}>General Dentistry</h2>
              <p style={servicesStyles.cardDescription}>
                Routine check-ups, cleanings, and preventive care to maintain your oral health.
              </p>
            </div>

            <div style={servicesStyles.serviceCard}>
              <h2 style={servicesStyles.cardTitle}>Orthodontics</h2>
              <p style={servicesStyles.cardDescription}>
                Braces, veneers, and other treatments to straighten and enhance your smile.
              </p>
            </div>

            <div style={servicesStyles.serviceCard}>
              <h2 style={servicesStyles.cardTitle}>Restorative Treatments</h2>
              <p style={servicesStyles.cardDescription}>
                Implants, crowns, and bridges to restore function and appearance.
              </p>
            </div>
          </div>

          <div style={servicesStyles.bookingBanner}>
            <div style={servicesStyles.bookingText}>
              <h3 style={servicesStyles.bookingTitle}>Book an Appointment</h3>
              <p style={servicesStyles.bookingPara}>
                Scheduling your dental visit is quick and easy. At King Epres Dental Clinic, we offer flexible appointment times to fit your schedule. Whether it's a routine check-up, orthodontic consultation, or restorative treatment, you can book online or call us directly. Our friendly staff will guide you through the process and ensure your visit is smooth, efficient, and comfortable.
              </p>
              <h4 style={servicesStyles.stepsTitle}>Steps to Book:</h4>
              <ol style={servicesStyles.stepsList}>
                <li>Choose your preferred date and time.</li>
                <li>Select the service you need.</li>
                <li>Confirm your appointment online or over the phone.</li>
                <li>Receive a reminder before your visit.</li>
              </ol>
              <button style={servicesStyles.bookBtn} onClick={() => scrollToSection(homeRef)}>
                Book Now →
              </button>
            </div>
            <div style={servicesStyles.imageSection}></div>
          </div>
        </div>
      </section>

      {/* ----------------- CONTACT / FOOTER SECTION ----------------- */}
      <section ref={contactRef} style={{ width: '100%', paddingTop: '100px', paddingBottom: '40px', backgroundColor: 'white' }}>
        <div style={contactStyles.container}>
          <h1 style={contactStyles.header}>Contact Us</h1>

          <div style={contactStyles.grid}>
            <div>
              <h2 style={contactStyles.sectionTitle}>King Epres Dental Clinic</h2>
              <p style={contactStyles.description}>
                At King Epres Dental Clinic, every smile matters. We provide modern, compassionate dental care across all our branches to keep you healthy, confident, and smiling.
              </p>
              <h3 style={contactStyles.sectionTitle}>Follow Us</h3>
              <div style={contactStyles.socialLinks}>
                <Facebook size={24} style={{ cursor: 'pointer' }} />
                <Instagram size={24} style={{ cursor: 'pointer' }} />
                <Twitter size={24} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <div>
              <h2 style={contactStyles.sectionTitle}>Quick Links</h2>
              <ul style={contactStyles.linkList}>
                <li style={contactStyles.linkItem} onClick={() => scrollToSection(homeRef)}>Home</li>
                <li style={contactStyles.linkItem} onClick={() => scrollToSection(aboutRef)}>About Us</li>
                <li style={contactStyles.linkItem} onClick={() => scrollToSection(servicesRef)}>Services</li>
                <li style={contactStyles.linkItem} onClick={() => navigate('/login')}>Appointment</li>
              </ul>
            </div>

            <div style={contactStyles.contactInfo}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div style={contactStyles.locationGroup}>
                  <div style={contactStyles.locationTitle}><MapPin size={18} color="#ff4d4d" /> Gil Puyat, Pasay</div>
                  <div style={contactStyles.infoItem}><Phone size={14} /> Phone: +63 9XX XXX XXXX</div>
                  <div style={contactStyles.infoItem}><Mail size={14} /> Email: info@yourwebsite.com</div>
                </div>

                <div style={contactStyles.locationGroup}>
                  <div style={contactStyles.locationTitle}><MapPin size={18} color="#ff4d4d" /> Angeles, Pampanga</div>
                  <div style={contactStyles.infoItem}><Phone size={14} /> Phone: +63 9XX XXX XXXX</div>
                  <div style={contactStyles.infoItem}><Mail size={14} /> Email: info@yourwebsite.com</div>
                </div>
              </div>

              <div style={contactStyles.locationGroup}>
                <div style={contactStyles.locationTitle}><MapPin size={18} color="#ff4d4d" /> Sta. Ana, Manila</div>
                <div style={contactStyles.infoItem}><Phone size={14} /> Phone: +63 9XX XXX XXXX</div>
                <div style={contactStyles.infoItem}><Mail size={14} /> Email: info@yourwebsite.com</div>
              </div>
            </div>
          </div>

          <div style={contactStyles.footerLine}>
            <div>© 2026 King Epres Dental Clinic. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ cursor: 'pointer' }}>Terms Of Service</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Cookie Policy</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;