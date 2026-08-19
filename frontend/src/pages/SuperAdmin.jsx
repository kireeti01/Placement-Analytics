import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaSchool, FaCheckCircle, FaUsers, FaUserShield, 
  FaChartBar, FaKey, FaEnvelope, FaUserGraduate,
  FaCopy, FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { collegeAPI, studentAPI } from '../services/api';

const SuperAdmin = () => {
  const location = useLocation();
  const [colleges, setColleges] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    totalColleges: 0,
    activeColleges: 0,
    totalStudents: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    adminId: '',
    username: '',
    email: '',
    newPassword: ''
  });
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [existingAdmin, setExistingAdmin] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [collegesRes, adminsRes, studentsRes] = await Promise.allSettled([
        collegeAPI.getAll(),
        localStorage.getItem('token') ? collegeAPI.getAdminAccounts() : Promise.resolve({ data: [] }),
        studentAPI.getAll()
      ]);

      const collegesData = collegesRes.status === 'fulfilled' ? (collegesRes.value?.data || []) : [];
      const adminsData = adminsRes.status === 'fulfilled' ? (adminsRes.value?.data || []) : [];
      const allStudents = studentsRes.status === 'fulfilled' ? (studentsRes.value?.data || []) : [];

      setColleges(collegesData);
      setAdmins(adminsData);
      console.log('Admin accounts loaded from API:', adminsData.length);

      const totalStudents = allStudents.length;
      setStats({
        totalColleges: collegesData.length || 0,
        activeColleges: collegesData.filter(c => c.status === 'active').length || 0,
        totalStudents: totalStudents,
        totalAdmins: adminsData.length || 0
      });

      if (collegesRes.status === 'rejected' || studentsRes.status === 'rejected') {
        console.warn('Non-critical refresh issue while loading super admin data');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCollegeStatus = async (collegeId) => {
    try {
      const college = colleges.find(c => c.id === collegeId);
      if (!college) return;
      
      const newStatus = college.status === 'active' ? 'suspended' : 'active';
      await collegeAPI.update(collegeId, { ...college, status: newStatus });
      
      toast.success('College ' + newStatus + ' successfully!');
      loadData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update college status');
    }
  };

  const generateCredentials = (college) => {
    setSelectedCollege(college);
    
    const existingAdminAccount = admins.find(a => a.college_id === college.id);
    
    if (existingAdminAccount) {
      setExistingAdmin(existingAdminAccount);
      setCredentials({
        username: existingAdminAccount.username,
        password: '********',
        email: existingAdminAccount.email
      });
      setShowCredentialModal(true);
      return;
    }
    
    setExistingAdmin(null);
    
    const baseUsername = college.code.toLowerCase() + '_admin';
    
    const existingUsernames = admins.map(a => a.username);
    let finalUsername = baseUsername;
    let counter = 1;
    while (existingUsernames.includes(finalUsername)) {
      finalUsername = baseUsername + '_' + counter;
      counter++;
    }
    
    const password = 'College@' + Math.floor(Math.random() * 10000) + '!';
    
    setCredentials({
      username: finalUsername,
      password: password,
      email: college.email || ''
    });
    setShowCredentials(true);
  };

  const saveCredentials = async () => {
    if (!selectedCollege) return;

    if (!credentials.username || !credentials.password || !credentials.email) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await collegeAPI.createAdminAccount({
        username: credentials.username,
        password: credentials.password,
        email: credentials.email,
        college_id: selectedCollege.id,
        college_name: selectedCollege.name
      });

      console.log('Admin account created:', response.data);
      
      setShowCredentials(false);
      setShowCredentialModal(true);
      
      toast.success('Credentials generated for ' + selectedCollege.name);
      loadData();
    } catch (error) {
      console.error('Save credentials error:', error);
      const errorMsg = error.response?.data?.error || 'Unknown error';
      toast.error('Failed to generate credentials: ' + errorMsg);
    }
  };

  // Only open the modal after the user clicks Reset Password.
  const handleResetPassword = (admin) => {
    const defaultPassword = 'College@' + Math.floor(Math.random() * 10000) + '!';
    setResetPasswordData({
      adminId: admin.id,
      username: admin.username,
      email: admin.email,
      newPassword: defaultPassword
    });
    setShowResetPassword(true);
  };

  // Generate and send the password only after the confirm button is clicked.
  const confirmResetPassword = async () => {
    if (resetLoading) return;
    if (!resetPasswordData.adminId) {
      toast.error('No admin selected');
      return;
    }

    const finalPassword = String(resetPasswordData.newPassword || 'College@' + Math.floor(Math.random() * 10000) + '!').trim();

    setResetLoading(true);
    try {
      console.log('🔄 Resetting password for admin:', resetPasswordData.adminId);
      console.log('🔑 New password:', finalPassword);

      const response = await collegeAPI.resetAdminPassword(
        resetPasswordData.adminId,
        finalPassword
      );

      const responsePassword = response.data?.newPassword || finalPassword;
      console.log('📥 Response:', response.data);

      toast.success('✅ Password reset successfully! New password: ' + responsePassword, { duration: 10000 });
      setShowResetPassword(false);

      setResetPasswordData({
        adminId: '',
        username: '',
        email: '',
        newPassword: ''
      });
      loadData();
    } catch (error) {
      console.error('❌ Reset password error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Network error - please try again';
      toast.error('❌ ' + errorMsg);
    } finally {
      setResetLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(label + ' copied!');
  };

  const getPath = () => {
    return location.pathname;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading...</div>;
  }

  // Admin Accounts View
  if (getPath() === '/super-admin/admins') {
    return (
      <div className="dashboard-section active">
        <div className="ai-insights-banner">
          <h2><FaUserShield /> Admin Accounts</h2>
          <p>Manage College Admin (TPO) credentials.</p>
        </div>
        
        <div className="table-card">
          <div className="table-header"><h3>College Admin Accounts ({admins.length})</h3></div>
          <table className="data-table">
            <thead>
              <tr><th>Username</th><th>College</th><th>Email</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    No admin accounts created yet. Approve colleges to auto-generate credentials.
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin.id || index}>
                    <td><strong>{admin.username}</strong></td>
                    <td>{admin.college_name || admin.college?.name}</td>
                    <td>{admin.email}</td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', marginRight: '6px', color: 'var(--warning)' }}
                        onClick={() => handleResetPassword(admin)}
                      >
                        <FaSync /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reset Password Modal */}
        {showResetPassword && resetPasswordData.adminId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => {
            setShowResetPassword(false);
            setResetPasswordData({
              adminId: '',
              username: '',
              email: '',
              newPassword: ''
            });
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px' }}>🔑</div>
                <h2 style={{ color: 'var(--warning)' }}>Reset Password</h2>
                <p>Reset password for <strong>{resetPasswordData.username}</strong></p>
              </div>

              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span><strong>New Password:</strong></span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{resetPasswordData.newPassword}</span>
                  <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => copyToClipboard(resetPasswordData.newPassword, 'Password')}>
                    <FaCopy />
                  </button>
                </div>
              </div>

              <div style={{ background: '#e8f4f8', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e3a5f' }}>
                  <FaEnvelope /> The new password will be sent to: <strong>{resetPasswordData.email}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => {
                  setShowResetPassword(false);
                  setResetPasswordData({
                    adminId: '',
                    username: '',
                    email: '',
                    newPassword: ''
                  });
                }}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 2 }} 
                  onClick={confirmResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Resetting...' : <><FaSync /> Reset Password</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Colleges View
  if (getPath() === '/super-admin/colleges' || getPath() === '/super-admin/') {
    const hasAdmin = (collegeId) => {
      return admins.some(a => a.college_id === collegeId);
    };

    return (
      <div className="dashboard-section active">
        <p style={{ color: '#6c757d', fontSize: '13px', marginBottom: '16px' }}>
          Manage all colleges registered on the platform.
        </p>
        <div className="table-card">
          <div className="table-header">
            <h3>All Colleges ({colleges.length})</h3>
            <span style={{ fontSize: '12px', color: '#6c757d' }}>
              {colleges.filter(c => c.status === 'active').length} active
            </span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>College</th>
                <th>Code</th>
                <th>Status</th>
                <th>Admin Account</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {colleges.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    No colleges found. Approve registration requests to add colleges.
                  </td>
                </tr>
              ) : (
                colleges.map((college) => {
                  const adminExists = hasAdmin(college.id);
                  return (
                    <tr key={college.id}>
                      <td><strong>{college.name}</strong></td>
                      <td>{college.code}</td>
                      <td>
                        <span className={'badge ' + (college.status === 'active' ? 'badge-success' : 'badge-danger')}>
                          {college.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        {adminExists ? (
                          <span className="badge badge-success">Admin Created</span>
                        ) : (
                          <span className="badge badge-warning">No Admin</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                          onClick={() => generateCredentials(college)}
                        >
                          <FaKey /> {adminExists ? 'View Credentials' : 'Generate'}
                        </button>
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600', marginLeft: '8px' }}
                          onClick={() => toggleCollegeStatus(college.id)}
                        >
                          {college.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Credential Generation Modal - For New Admin */}
        {showCredentials && selectedCollege && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setShowCredentials(false)}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '550px',
              width: '90%'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2><FaKey /> Generate Credentials</h2>
                <button className="btn btn-outline" onClick={() => setShowCredentials(false)}>Close</button>
              </div>

              <div style={{ background: '#f0f7ff', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <p><strong>College:</strong> {selectedCollege.name}</p>
                <p><strong>Username:</strong> {credentials.username}</p>
              </div>

              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={credentials.username} 
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="text" 
                  value={credentials.password} 
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group">
                <label>Admin Email</label>
                <input 
                  type="email" 
                  value={credentials.email} 
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCredentials(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={saveCredentials}>
                  <FaEnvelope /> Generate & Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credential Display Modal - For Existing Admin */}
        {showCredentialModal && selectedCollege && !showCredentials && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setShowCredentialModal(false)}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px' }}>🔑</div>
                <h2 style={{ color: 'var(--accent)' }}>Admin Account Exists</h2>
                <p style={{ color: '#6c757d' }}>This college already has an admin account:</p>
                <p><strong>{selectedCollege?.name}</strong></p>
              </div>

              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
                  <span><strong>Username:</strong></span>
                  <span style={{ fontFamily: 'monospace' }}>{credentials.username}</span>
                  <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => copyToClipboard(credentials.username, 'Username')}>
                    <FaCopy />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span><strong>Email:</strong></span>
                  <span style={{ fontFamily: 'monospace' }}>{credentials.email}</span>
                  <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => copyToClipboard(credentials.email, 'Email')}>
                    <FaCopy />
                  </button>
                </div>
              </div>

              <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                  <FaKey /> Password was sent to the admin's email. Click "Reset Password" in Admin Accounts to generate a new one.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => {
                  setShowCredentialModal(false);
                  window.location.href = '/super-admin/admins';
                }}>
                  <FaUserShield /> Go to Admin Accounts
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowCredentialModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Platform Stats View
  if (getPath() === '/super-admin/stats') {
    return (
      <div className="dashboard-section active">
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon"><FaSchool /></div>
            <div className="stat-value">{stats.totalColleges || 0}</div>
            <div className="stat-label">Total Colleges</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-value">{stats.activeColleges || 0}</div>
            <div className="stat-label">Active Colleges</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-value">{stats.totalStudents || 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card teal">
            <div className="stat-icon"><FaUserShield /></div>
            <div className="stat-value">{stats.totalAdmins || 0}</div>
            <div className="stat-label">Admin Accounts</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SuperAdmin;
