import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';
import './QRScanner.css';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [verificationData, setVerificationData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [qrType, setQrType] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' }
  ];

  useEffect(() => {
    if (scanning && !manualMode && !scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [ 0 ], // QR_CODE
          verbose: false
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanError);
      scannerRef.current = html5QrcodeScanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          // Suppress error on unmount
          console.log('Scanner cleanup');
        });
        scannerRef.current = null;
      }
    };
  }, [scanning, manualMode]);

  const onScanSuccess = async (decodedText) => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
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
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Invalid QR code' 
      });
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
    setScanning(true);
  };

  const startManualMode = () => {
    setVerificationData(null);
    setQrType(null);
    setMessage({ type: '', text: '' });
    setManualMode(true);
    setScanning(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
    setManualMode(false);
  };

  const resetScanner = () => {
    setVerificationData(null);
    setQrType(null);
    setMessage({ type: '', text: '' });
    setManualInput('');
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

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="QR Code Scanner" />

        <div className="qr-scanner-container">
          <div className="scanner-card">
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {!scanning && !verificationData && (
              <div className="scanner-start">
                <h2>Scan Student QR Code</h2>
                <p>Choose scanning method for Permission Letter or Outpass</p>
                
                <div className="scan-mode-buttons">
                  <button 
                    className="btn btn-primary mode-btn"
                    onClick={startCameraScanning}
                  >
                    📷 Scan with Camera
                  </button>
                  <button 
                    className="btn btn-secondary mode-btn"
                    onClick={startManualMode}
                  >
                    ⌨️ Enter Manually
                  </button>
                </div>
              </div>
            )}

            {scanning && !manualMode && (
              <div className="scanner-active">
                <div id="qr-reader" style={{ width: '100%' }}></div>
                <button 
                  className="btn btn-secondary"
                  onClick={stopScanning}
                  style={{ marginTop: '20px', width: '100%' }}
                >
                  Cancel Scanning
                </button>
              </div>
            )}

            {scanning && manualMode && (
              <div className="manual-input-section">
                <h3>Manual QR Code Entry</h3>
                <form onSubmit={handleManualSubmit} className="manual-input-form">
                  <div className="form-group">
                    <label>QR Code Data:</label>
                    <textarea
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Paste QR code data here (JSON format)"
                      rows="6"
                      className="qr-input"
                    />
                  </div>
                  <div className="manual-actions">
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !manualInput.trim()}
                    >
                      {loading ? 'Verifying...' : 'Verify QR Code'}
                    </button>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={stopScanning}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
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
      </div>
    </div>
  );
};

export default QRScanner;