import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });



  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/parent/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };



  const menuItems = [
    { label: 'Dashboard', path: '/parent' },
    { label: 'PL Requests', path: '/parent/pl-requests' },
    { label: 'Request History', path: '/parent/request-history' }
  ];

  return (
    <DashboardLayout title="Parent Dashboard" menuItems={menuItems}>
      <div className="welcome-message">
        <h1>Welcome, {user?.name}!</h1>
        <p>Monitor your child's permission letter requests</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.pendingRequests}</h3>
          <p>Pending Requests</p>
        </div>
        <div className="stat-card">
          <h3>{stats.approvedRequests}</h3>
          <p>Approved by You</p>
        </div>
        <div className="stat-card">
          <h3>{stats.rejectedRequests}</h3>
          <p>Rejected by You</p>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={() => window.location.href = '/parent/pl-requests'}>
            View Pending Requests
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/parent/request-history'}>
            View Request History
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DelayedStudents;