import React, { useState, useEffect } from 'react';
import DashboardLayout from '../common/DashboardLayout';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Reports.css';

const Reports = () => {
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState('all');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');

     const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Reports', path: '/warden/reports' }
  ];

    useEffect(() => {
        fetchLogs();
    }, [year, month]);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/warden/logs/yearly?year=${year}&month=${month}`);
            setLogs(response.data);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Failed to load logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PL') return !log.type.toLowerCase().includes('outpass');
        if (activeTab === 'OUTPASS') return log.type.toLowerCase().includes('outpass');
        return true;
    });

    const handleDownload = () => {
        if (filteredLogs.length === 0) return;

        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text('Students Yearly Report', 14, 15);
        
        doc.setFontSize(10);
        doc.text(`Year: ${year}`, 14, 25);
        if (month !== 'all') {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            doc.text(`Month: ${monthNames[parseInt(month) - 1]}`, 60, 25);
        }
        doc.text(`Category: ${activeTab === 'ALL' ? 'All Categories' : activeTab === 'PL' ? 'PL (Vacation)' : 'Outpass'}`, 14, 30);
        
        const headers = [['Type', 'Student Name', 'Reg No', 'Room', 'Department', 'Reason', 'Place of Visit', 'Out Time', 'In Time', 'Status']];
        
        const tableData = filteredLogs.map(log => [
            log.type,
            log.studentName,
            log.regNo,
            log.roomNo,
            log.department,
            log.reason,
            log.place,
            log.outTime ? new Date(log.outTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '---',
            log.inTime ? new Date(log.inTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '---',
            log.status
        ]);

        autoTable(doc, {
            head: headers,
            body: tableData,
            startY: 35,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save(`Warden_Report_${activeTab}_${month !== 'all' ? month + '_' : ''}${year}.pdf`);
    };

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2024; i--) {
        years.push(i.toString());
    }

    return (
        <DashboardLayout title="Warden Reports" menuItems={menuItems}>
            <div className="reports-container">
                <div className="reports-header">
                    <div className="reports-header-text">
                        <h2>Yearly Log Details</h2>
                        <p>View and download student transaction history for the selected year</p>
                    </div>
                    <div className="report-controls">
                        <div className="year-select-wrapper">
                            <select
                                className="year-select"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                <option value="all">All Months</option>
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                            <span className="select-arrow">▼</span>
                        </div>
                        <div className="year-select-wrapper">
                            <select
                                className="year-select"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <span className="select-arrow">▼</span>
                        </div>
                        <button
                            className="export-btn"
                            onClick={handleDownload}
                            disabled={filteredLogs.length === 0}
                        >
                            <span>📥</span> Download PDF
                        </button>
                    </div>
                </div>

                <div className="reports-tabs">
                    <button
                        className={`report-tab ${activeTab === 'ALL' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ALL')}
                    >
                        All Categories
                    </button>
                    <button
                        className={`report-tab ${activeTab === 'PL' ? 'active' : ''}`}
                        onClick={() => setActiveTab('PL')}
                    >
                        PL (Vacation)
                    </button>
                    <button
                        className={`report-tab ${activeTab === 'OUTPASS' ? 'active' : ''}`}
                        onClick={() => setActiveTab('OUTPASS')}
                    >
                        Outpass
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{ marginBottom: '25px', padding: '15px' }}>
                        ⚠️ {error}
                    </div>
                )}

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loader"></div>
                            <p>Fetching yearly logs...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📂</div>
                            <h3>No Logs Found</h3>
                            <p>No {activeTab !== 'ALL' ? activeTab + ' ' : ''}logs recorded for {month !== 'all' ? `month ${month} of` : 'the year'} {year}.</p>
                        </div>
                    ) : (
                        <div className="reports-table-container">
                            <table className="reports-table">
                                <thead>
                                    <tr>
                                        <th>Report Type</th>
                                        <th>Student Details</th>
                                        <th>Reason & Place</th>
                                        <th>Timestamps</th>
                                        <th>Current Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log._id}>
                                            <td>
                                                <span className={`type-badge ${log.type.toLowerCase().includes('outpass') ? 'outpass' : 'pl'}`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="student-info">
                                                    <div className="student-name">{log.studentName}</div>
                                                    <div className="student-meta">{log.regNo} | Room: {log.roomNo}</div>
                                                    <div className="student-dept">{log.department}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="reason-info">
                                                    <div className="reason-text">{log.reason}</div>
                                                    <div className="place-text">📍 {log.place}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="time-info">
                                                    <div className="time-item">
                                                        <span className="time-label">OUT:</span>
                                                        <span className="time-value">
                                                            {log.outTime ? new Date(log.outTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '---'}
                                                        </span>
                                                    </div>
                                                    <div className="time-item">
                                                        <span className="time-label">IN:</span>
                                                        <span className="time-value">
                                                            {log.inTime ? new Date(log.inTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '---'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`status-text ${log.status.toLowerCase().replace(' ', '-')}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Reports;
