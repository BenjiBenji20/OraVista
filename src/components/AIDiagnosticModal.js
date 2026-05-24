import React, { useState } from 'react';
import { X, ZoomIn, RotateCw, CheckCircle, FileText, Cpu } from 'lucide-react';

function AIDiagnosticModal({ isOpen, onClose, record }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showAI, setShowAI] = useState(true);

  if (!isOpen || !record) return null;

  // Format remote or local image path
  const getImageUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `http://localhost:5000/${filePath}`;
  };

  // Safe parse of ai_findings JSON if it is a string
  let parsedFindings = null;
  if (record.ai_findings) {
    if (typeof record.ai_findings === 'string') {
      try {
        parsedFindings = JSON.parse(record.ai_findings);
      } catch (e) {
        console.error("Error parsing ai_findings:", e);
      }
    } else {
      parsedFindings = record.ai_findings;
    }
  }

  const annotations = parsedFindings?.annotations || parsedFindings?.predictions || [];
  const isVerified = parsedFindings?.human_verified === true;

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const imageUrl = getImageUrl(record.file_path);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <header style={styles.modalHeader}>
          <div style={styles.headerTitleGroup}>
            <Cpu size={22} color="#10b981" />
            <h2 style={styles.modalTitle}>AI Diagnostic Findings</h2>
            {isVerified && (
              <span style={styles.verifiedBadge}>
                <CheckCircle size={14} style={{ marginRight: '5px' }} />
                verified by dentist
              </span>
            )}
          </div>
          <button style={styles.closeHeaderBtn} onClick={onClose} title="Close Modal">
            <X size={24} color="white" />
          </button>
        </header>

        {/* 3-COLUMN LAYOUT */}
        <div style={styles.columnsContainer}>
          {/* COLUMN 1: Scanned Diagnostic Imaging (50%) */}
          <div style={styles.columnLeft}>
            <div style={styles.columnHeaderRow}>
              <h3 style={styles.columnTitle}>Scanned Diagnostic Imaging</h3>
              <div style={styles.viewerActions}>
                <button style={styles.vBtn} onClick={handleZoom} title={isZoomed ? "Zoom Out" : "Zoom In"}>
                  <ZoomIn size={14} /> {isZoomed ? "1.0x" : "1.5x"}
                </button>
                <button style={styles.vBtn} onClick={handleRotate} title="Rotate 90°">
                  <RotateCw size={14} /> Rotate
                </button>
                <button style={styles.toggleBtn} onClick={() => setShowAI(!showAI)}>
                  {showAI ? 'Hide AI Overlays' : 'Show AI Overlays'}
                </button>
              </div>
            </div>

            <div style={styles.imageAreaContainer}>
              <div
                style={{
                  position: 'relative',
                  transform: `rotate(${rotation}deg) scale(${isZoomed ? 1.5 : 1})`,
                  transition: 'transform 0.3s ease',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {imageUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <img
                      src={imageUrl}
                      alt="Diagnostic Scan Preview"
                      style={styles.scanImage}
                    />

                    {/* Bounding box overlays */}
                    {showAI &&
                      annotations.map((ann, idx) => {
                        const box = ann.box;
                        if (!box) return null;
                        
                        const borderColor = isVerified ? '#10b981' : '#ef4444';
                        const labelBgColor = isVerified ? '#10b981' : '#ef4444';
                        const isNearTop = box.y_min < 0.08;

                        return (
                          <div
                            key={idx}
                            style={{
                              position: 'absolute',
                              border: `2px solid ${borderColor}`,
                              borderRadius: '4px',
                              zIndex: 5,
                              top: `${box.y_min * 100}%`,
                              left: `${box.x_min * 100}%`,
                              width: `${box.width * 100}%`,
                              height: `${box.height * 100}%`,
                              pointerEvents: 'none',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: '-2px',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: '700',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                backgroundColor: labelBgColor,
                                ...(isNearTop ? { top: '2px' } : { top: '-22px' }),
                              }}
                            >
                              {ann.name}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>No diagnostic image available</p>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Dental Findings (25%) */}
          <div style={styles.columnMiddle}>
            <div style={styles.columnHeaderRow}>
              <h3 style={styles.columnTitle}>Dental Findings</h3>
            </div>

            <div style={styles.scrollableContent} className="modal-scroll-container">
              {annotations.length > 0 ? (
                <div style={styles.findingsList}>
                  {annotations.map((ann, idx) => (
                    <div key={idx} style={styles.findingCard}>
                      <p style={styles.findingName}>
                        {ann.name} {" "}
                        <span style={{
                          ...styles.confBadge,
                          backgroundColor: isVerified ? '#10b981' : '#f59e0b'
                        }}>
                          {Math.round(ann.confidence <= 1 ? ann.confidence * 100 : ann.confidence)}% Confidence
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyContainer}>
                  <p style={styles.emptyText}>No dental findings annotated on this scan.</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Clinical Notes (25%) */}
          <div style={styles.columnRight}>
            <h3 style={{ ...styles.columnTitle, marginBottom: '20px' }}>Clinical Notes</h3>

            <div style={styles.scrollableContent} className="modal-scroll-container">
              {record.clinical_notes && record.clinical_notes.trim() !== "" ? (
                <div style={styles.notesCard}>
                  <p style={styles.notesText}>{record.clinical_notes}</p>
                </div>
              ) : (
                <div style={styles.emptyContainer}>
                  <FileText size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: '10px' }} />
                  <p style={styles.emptyText}>No clinical notes available for this patient document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 8, 30, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  modalContent: {
    background: '#091238',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '30px',
    width: '1200px',
    height: '750px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    position: 'relative',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '20px',
    marginBottom: '20px',
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: 'white',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
  },
  closeHeaderBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.05)'
    }
  },
  columnsContainer: {
    flex: 1,
    display: 'flex',
    gap: '25px',
    minHeight: 0, // critical for child overflow scrolling
    boxSizing: 'border-box',
  },
  columnLeft: {
    flex: '2 1 0%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    boxSizing: 'border-box',
  },
  columnMiddle: {
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    paddingLeft: '20px',
    boxSizing: 'border-box',
  },
  columnRight: {
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    paddingLeft: '20px',
    boxSizing: 'border-box',
  },
  columnHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  columnTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  },
  viewerActions: {
    display: 'flex',
    gap: '8px',
  },
  vBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  imageAreaContainer: {
    flex: 1,
    backgroundColor: '#00051e',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto', // Allow panning when zoomed
    padding: '10px',
  },
  scanImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '8px',
  },
  toggleBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '5px',
  },
  findingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  findingCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '15px',
  },
  findingName: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: 'white',
  },
  confBadge: {
    fontSize: '10px',
    padding: '3px 8px',
    borderRadius: '10px',
    fontWeight: 'bold',
    color: 'white',
    display: 'inline-block',
  },
  notesCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '20px',
  },
  notesText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '200px',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    margin: 0,
  },
};

export default AIDiagnosticModal;
