import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import jsQR from 'jsqr';
import { api, BASE_URL } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';
import './QRScanner.css';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [verificationData, setVerificationData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [qrType, setQrType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const scannerRef = useRef(null);
  const qrRegionRef = useRef(null);



  // Reset state only on mount
  useEffect(() => {
    setScanning(false);
    setManualMode(false);
    setImageUploadMode(false);
    setUploadedImage(null);
    setManualInput('');
    setMessage({ type: '', text: '' });
    setVerificationData(null);
    setQrType(null);
  }, []);

  // Scanning logic
  useEffect(() => {
    let isActive = true;
    let html5QrCode;

    const startScanner = async () => {
      if (!scanning || manualMode || imageUploadMode) return;

      // Ensure any old instance is fully gone
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
        } catch (e) { }
        scannerRef.current = null;
      }

      if (!isActive) return;

      setCameraStarting(true);

      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          onScanSuccess,
          onScanError
        );

        if (isActive) {
          setCameraStarting(false);
        } else {
          // If deactivated during startup, stop it now
          await html5QrCode.stop();
          await html5QrCode.clear();
          scannerRef.current = null;
        }
      } catch (err) {
        console.error("Unable to start scanning", err);
        if (isActive) {
          setCameraStarting(false);
          setMessage({
            type: 'error',
            text: 'Failed to start camera. Please check permissions and try again.'
          });
          setScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      isActive = false;
      if (scannerRef.current) {
        const currentScanner = scannerRef.current;
        scannerRef.current = null;
        currentScanner.stop().catch(() => { }).then(() => {
          currentScanner.clear().catch(() => { });
        });
      }
    };
  }, [scanning, manualMode, imageUploadMode]); // Removed verificationData to prevent reset on success

  const onScanSuccess = async (decodedText) => {
    console.log('QR Code scanned successfully:', decodedText);

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.log('Scanner stop error (non-critical):', err);
      }
      scannerRef.current = null;
    }

    // Don't set scanning to false yet - keep the active UI visible or transition smoothly
    await verifyQR(decodedText);
  };

  const onScanError = (error) => {
    // Suppress all scan errors - they're normal during scanning
  };

  const verifyQR = async (qrData) => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const parsedData = JSON.parse(qrData);
      const type = parsedData.type || 'pl';
      setQrType(type);

      let response;
      if (type === 'outpass') {
        response = await api.post('/warden/outpass/verify-qr', { qrData });
      } else {
        response = await api.post('/warden/verify-qr', { qrData });
      }

      setVerificationData({
        ...response.data.data,
        qrData
      });
      setMessage({
        type: 'success',
        text: `${type === 'outpass' ? 'Outpass' : 'Permission Letter'} verified successfully!`
      });
      setManualInput('');
      setScanning(false); // Successfully verified, hide scanner
    } catch (error) {
      console.error('Verification error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Invalid QR code'
      });
      setScanning(false); // Error occurred, hide scanner and show start screen with error
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      verifyQR(manualInput.trim());
    }
  };

  const handleAction = async (action) => {
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      let response;
      if (qrType === 'outpass') {
        response = await api.post('/warden/outpass/log-action', {
          qrData: verificationData.qrData,
          action
        });
      } else {
        response = await api.post('/warden/log-entry-exit', {
          qrData: verificationData.qrData,
          action
        });
      }

      setMessage({
        type: 'success',
        text: response.data.message
      });

      setTimeout(() => {
        setVerificationData(null);
        setQrType(null);
        setMessage({ type: '', text: '' });
        setScanning(false);
        setManualMode(false);
        setImageUploadMode(false);
      }, 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to log action'
      });
    } finally {
      setLoading(false);
    }
  };

  const startCameraScanning = () => {
    setVerificationData(null);
    setQrType(null);
    setMessage({ type: '', text: '' });
    setManualMode(false);
    setImageUploadMode(false);
    setScanning(true);
  };

  const startManualMode = () => {
    setVerificationData(null);
    setQrType(null);
    setMessage({ type: '', text: '' });
    setManualMode(true);
    setScanning(true);
    setImageUploadMode(false);
  };

  const startImageUploadMode = () => {
    setVerificationData(null);
    setQrType(null);
    setMessage({ type: '', text: '' });
    setImageUploadMode(true);
    setScanning(true);
    setManualMode(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    console.log('Image upload started:', file.name);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file');
      }

      // 1. Try with html5-qrcode first
      try {
        const html5QrCode = new Html5Qrcode("temp-qr-reader");
        console.log('Scanning image with html5-qrcode...');

        // Scan the uploaded image (second param false for non-verbose)
        const qrCodeData = await html5QrCode.scanFile(file, false);

        console.log('QR code detected by html5-qrcode:', qrCodeData);

        // Clean up
        await html5QrCode.clear();

        // Verify the QR code
        await verifyQR(qrCodeData);

        // Set the uploaded image for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target.result);
        };
        reader.readAsDataURL(file);

        setLoading(false);
        return; // Success, exit the function
      } catch (html5Error) {
        console.warn('html5-qrcode failed to detect QR, trying jsQR fallback...', html5Error);
      }

      // 2. jsQR Fallback
      const reader = new FileReader();
      reader.onload = async (event) => {
        const image = new Image();
        image.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Limit oversized images to improve performance/detection
            const MAX_SIZE = 1200;
            let width = image.width;
            let height = image.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            context.drawImage(image, 0, 0, width, height);

            const imageData = context.getImageData(0, 0, width, height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              console.log('QR code detected by jsQR fallback:', code.data);
              setUploadedImage(event.target.result);
              await verifyQR(code.data);
            } else {
              // Try one more time with inverted colors for dark theme/high contrast QR codes
              const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "alwaysInvert",
              });

              if (codeInverted) {
                console.log('QR code detected by jsQR (inverted):', codeInverted.data);
                setUploadedImage(event.target.result);
                await verifyQR(codeInverted.data);
              } else {
                console.error('All scanners failed to detect QR code');
                setMessage({
                  type: 'error',
                  text: 'Could not detect a valid QR code in this image. Please ensure the QR code is clearly visible and not too blurry.'
                });
              }
            }
          } catch (err) {
            console.error('jsQR processing error:', err);
            setMessage({ type: 'error', text: 'Error scanning image. Please try another one.' });
          } finally {
            setLoading(false);
          }
        };
        image.onerror = () => {
          setMessage({ type: 'error', text: 'Error loading image file.' });
          setLoading(false);
        };
        image.src = event.target.result;
      };
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Error reading file.' });
        setLoading(false);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Initial processing error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'An unexpected error occurred.'
      });
      setLoading(false);
    }
  };

  const resetImageUpload = () => {
    setUploadedImage(null);
    setImageUploadMode(false);
    setScanning(false);
  };

  const stopScanning = () => {
    // Reset all states immediately
    setScanning(false);
    setManualMode(false);
    setImageUploadMode(false);
    setUploadedImage(null);
    setManualInput('');
    setMessage({ type: '', text: '' });
    setVerificationData(null);
    setQrType(null);
    setLoading(false);
    setCameraStarting(false);

    // The actual scanner stop is handled by the useEffect cleanup
    // which triggers when 'scanning' is set to false.
  };

  const resetScanner = () => {
    setVerificationData(null);
    setQrType(null);
    setMessage({ type: '', text: '' });
    setManualInput('');
    setScanning(false);
    setManualMode(false);
    setImageUploadMode(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid Date';

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

   const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Reports', path: '/warden/reports' }
  ];

  return (
    <DashboardLayout title="QR Code Scanner" menuItems={menuItems}>
      <div className="qr-scanner-container">
        <div className="scanner-card">
          {/* Hidden element for image scanning - positioned off-screen but still in layout */}
          <div id="temp-qr-reader" style={{
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '300px',
            height: '300px',
            visibility: 'hidden'
          }}></div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {!scanning && !verificationData && (
            <div className="scanner-start">
              <h2>Scan Student QR Code</h2>
              <p>Choose scanning method for Permission Letter or Outpass</p>

              <div className="scan-options">
                <button
                  className="btn btn-primary camera-scan-btn"
                  onClick={startCameraScanning}
                >
                  <span>📷 Scan with Camera</span>
                </button>

                <div className="or-divider">OR</div>

                <div className="scan-mode-buttons">
                  <button
                    className="btn btn-secondary mode-btn"
                    onClick={startImageUploadMode}
                  >
                    📁 Upload Image
                  </button>
                  <button
                    className="btn btn-secondary mode-btn"
                    onClick={startManualMode}
                  >
                    ⌨️ Enter Manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanning && !manualMode && !imageUploadMode && (
            <div className="scanner-active">
              {cameraStarting && (
                <div className="camera-loading">
                  <p className="loading-text-glow">Starting Camera...</p>
                </div>
              )}
              {loading && !cameraStarting && (
                <div className="camera-loading">
                  <p className="loading-text-glow">Verifying Student...</p>
                </div>
              )}
              <div id="qr-reader" ref={qrRegionRef} style={{ width: '100%', minHeight: '300px', backgroundColor: '#000' }}></div>
              <div className="scanner-actions">
                <button
                  className="btn btn-secondary"
                  onClick={stopScanning}
                >
                  Cancel Scanning
                </button>
              </div>
            </div>
          )}

          {scanning && imageUploadMode && (
            <div className="image-upload-section">
              <div className="upload-header">
                <h3>Upload QR Code Image</h3>
                <p>Upload an image containing a QR code to scan</p>
              </div>
              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="file-input"
                  id="qr-image-upload"
                />
                <label htmlFor="qr-image-upload" className="file-upload-label">
                  {loading ? (
                    <div className="upload-loading">
                      <div className="loading-dots">
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                      </div>
                      <span>Scanning image...</span>
                    </div>
                  ) : (
                    <>
                      <span className="upload-icon">📁</span>
                      <span>Click to upload QR code image</span>
                      <span className="upload-subtext">Supports JPG, PNG, GIF formats</span>
                    </>
                  )}
                </label>

                {uploadedImage && verificationData && (
                  <div className="upload-success">
                    <div className="success-icon">✓</div>
                    <h4>QR Code Scanned Successfully!</h4>
                    <p>Student details loaded. Please confirm the action below.</p>
                  </div>
                )}
              </div>

              <div className="upload-actions">
                <button
                  className="btn btn-secondary"
                  onClick={resetImageUpload}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {scanning && manualMode && (
            <div className="manual-entry-container">
              <div className="manual-entry-card">
                <div className="manual-header">
                  <div className="header-icon">⌨️</div>
                  <div>
                    <h2>Manual Entry</h2>
                    <p className="header-subtitle">Enter QR code data manually</p>
                  </div>
                </div>

                <div className="entry-instructions">
                  <div className="instruction-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Get QR Data</h4>
                      <p>Copy the complete QR code JSON data from your source</p>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Paste Below</h4>
                      <p>Enter the JSON data in the text area below</p>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Verify</h4>
                      <p>Click verify to check the student details</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} className="manual-form">
                  <div className="form-field">
                    <label htmlFor="qr-data-input">
                      <span className="label-text">QR Code JSON Data</span>
                      <span className="label-required">*</span>
                    </label>
                    <textarea
                      id="qr-data-input"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder='Paste your QR code JSON data here...\n\nExample:\n{\n  "plId": "PL001",\n  "studentId": "STU001",\n  "regNo": "21CS001",\n  "name": "John Doe",\n  "roomNo": "A-101",\n  "hostelName": "Boys Hostel",\n  "placeOfVisit": "City Center",\n  "arrivalDateTime": "2024-01-15T18:00:00Z",\n  "type": "permission-letter"\n}'
                      rows="12"
                      className="data-input"
                      disabled={loading}
                      required
                    />
                    <div className="field-hint">
                      <span>💡 Tip: The data should be in valid JSON format</span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary verify-btn"
                      disabled={loading || !manualInput.trim()}
                    >
                      {loading ? (
                        <>
                          <div className="btn-loading-dots">
                            <div className="btn-loading-dot"></div>
                            <div className="btn-loading-dot"></div>
                            <div className="btn-loading-dot"></div>
                          </div>
                          <span>Verifying Data...</span>
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">✓</span>
                          <span>Verify QR Code</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary cancel-btn"
                      onClick={stopScanning}
                      disabled={loading}
                    >
                      <span className="btn-icon">✕</span>
                      <span>Cancel Entry</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {verificationData && (
            <div className="verification-result">
              <div className="result-header">
                <h3>{qrType === 'outpass' ? '🎫 Outpass Details' : '📋 Permission Letter Details'}</h3>
                <span className={`type-badge ${qrType}`}>
                  {qrType === 'outpass' ? '4-Hour Pass' : 'Permission Letter'}
                </span>
              </div>

              <div className="student-details">
                {/* Profile Photo */}
                <div className="detail-row" style={{ justifyContent: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {verificationData.profilePhoto ? (
                    <img
                      src={`${BASE_URL}${verificationData.profilePhoto}`}
                      alt="Student"
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #4ade80',
                        boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      color: 'white',
                      fontWeight: 'bold',
                      border: '3px solid #667eea',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                      {verificationData.studentName?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                </div>

                <div className="detail-row">
                  <span className="label">Student Name:</span>
                  <span className="value">{verificationData.studentName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Registration No:</span>
                  <span className="value">{verificationData.regNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Room No:</span>
                  <span className="value">{verificationData.roomNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Place of Visit:</span>
                  <span className="value">{verificationData.placeOfVisit}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Current Status:</span>
                  <span className={`value status ${verificationData.currentStatus.toLowerCase().replace(' ', '-')}`}>
                    {verificationData.currentStatus}
                  </span>
                </div>

                {qrType === 'outpass' && verificationData.exitTime && (
                  <>
                    <div className="detail-row">
                      <span className="label">Exit Time:</span>
                      <span className="value">{formatDateTime(verificationData.exitTime)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Expected Return:</span>
                      <span className="value">{formatDateTime(verificationData.expectedReturnTime)}</span>
                    </div>
                  </>
                )}

                {qrType === 'pl' && verificationData.arrivalDateTime && (
                  <div className="detail-row">
                    <span className="label">Expected Arrival:</span>
                    <span className="value">{formatDateTime(verificationData.arrivalDateTime)}</span>
                  </div>
                )}
              </div>

              <div className="action-section">
                <h4>Confirm Action:</h4>
                <div className="action-buttons">
                  <button
                    className="btn btn-success action-btn"
                    onClick={() => handleAction(verificationData.action)}
                    disabled={loading}
                  >
                    ✓ Confirm {verificationData.action === 'exit' ? 'Exit' : 'Entry'}
                  </button>
                  <button
                    className="btn btn-secondary action-btn"
                    onClick={resetScanner}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QRScanner;