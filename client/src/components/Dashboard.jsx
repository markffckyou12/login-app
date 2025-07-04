import { useState, useEffect } from 'react';
import axios from 'axios';
import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/users/profile/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.user) {
        setProfileData(response.data.user);
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleCancelEdit = () => {
    setShowEditProfile(false);
  };

  const handleProfileUpdate = (updatedUser, newToken) => {
    // Update local state
    setProfileData(updatedUser);
    
    // Update parent component if callback provided
    if (onUserUpdate) {
      onUserUpdate(updatedUser, newToken);
    }
    
    // Update token if provided (when email is changed)
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    
    // Close the modal
    setShowEditProfile(false);
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleCancelChangePassword = () => {
    setShowChangePassword(false);
  };

  const handlePasswordChangeSuccess = () => {
    // Could add any additional logic here after password change
    console.log('Password changed successfully');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>Welcome to Your Dashboard</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="user-info">
          <div className="user-info-header">
            <h3>User Information</h3>
            <button 
              onClick={handleEditProfile} 
              className="edit-profile-button"
            >
              Edit Profile
            </button>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>
                {profileData
                  ? [profileData.first_name, profileData.last_name].filter(Boolean).join(' ')
                  : [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Not provided'}
              </span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{profileData?.email || user?.email}</span>
            </div>
            <div className="info-item">
              <label>User ID:</label>
              <span>{profileData?.id || user?.id}</span>
            </div>
            {profileData?.created_at && (
              <div className="info-item">
                <label>Member Since:</label>
                <span>{new Date(profileData.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-content">
          <h3>Account Status</h3>
          <p>Your account is active and you are successfully logged in.</p>
          
          <div className="status-indicators">
            <div className="status-item success">
              <span className="status-dot"></span>
              <span>Authentication: Active</span>
            </div>
            <div className="status-item success">
              <span className="status-dot"></span>
              <span>Session: Valid</span>
            </div>
            <div className="status-item success">
              <span className="status-dot"></span>
              <span>Database: Connected</span>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-button" onClick={fetchProfile}>
              Refresh Profile
            </button>
            <button className="action-button" onClick={handleEditProfile}>
              Edit Profile
            </button>
            <button className="action-button" onClick={handleChangePassword}>
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          user={profileData || user}
          onProfileUpdate={handleProfileUpdate}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          isOpen={showChangePassword}
          onClose={handleCancelChangePassword}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard; 