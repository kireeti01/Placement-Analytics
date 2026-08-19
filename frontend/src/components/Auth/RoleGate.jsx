import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaUserShield, FaEye, FaServer, FaArrowLeft, FaSchool } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RoleGate = () => {
  const navigate = useNavigate();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    collegeName: '',
    username: '',
    message: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    const username = document.getElementById('loginUser')?.value?.trim() || '';
    const password = document.getElementById('loginPass')?.value?.trim() || '';
    
    console.log('🔑 Login attempt:', { username });
    
    try {
      const response = await authAPI.login(username, password);
      console.log('✅ Login response:', response.data);
      
      const { token, user, college, role } = response.data;
      
      // Store everything
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', user.username);
      window.dispatchEvent(new Event('app:token-changed'));
      
      if (college) {
        localStorage.setItem('collegeId', college.id);
        localStorage.setItem('collegeName', college.name);
      } else {
        localStorage.setItem('collegeId', '');
        localStorage.setItem('collegeName', 'Platform');
      }
      
      toast.success('Welcome ' + user.username + '!');
      
      // Navigate based on role
      if (role === 'super_admin') {
        navigate('/super-admin/colleges');
      } else if (role === 'admin') {
        navigate('/app/dashboard');
      } else {
        // For other roles like parent/student
        navigate('/app/dashboard');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginError(error.response?.data?.error || 'Invalid username or password');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem('role', 'guest');
    navigate('/select-college');
  };

  const goToRegistration = () => {
    navigate('/college-registration');
  };

  const backToChoice = () => {
    setShowAdminLogin(false);
    setShowSuperAdminLogin(false);
    setLoginError('');
  };

  const handleForgotCredentials = async (e) => {
    e.preventDefault();

    if (!supportForm.name || !supportForm.email || !supportForm.message) {
      toast.error('Please fill your name, email, and issue details');
      return;
    }

    setSupportLoading(true);
    try {
      const usernameFromLogin = document.getElementById('loginUser')?.value?.trim() || '';
      await authAPI.contactSuperAdmin({
        ...supportForm,
        username: supportForm.username || usernameFromLogin
      });
      toast.success('Your issue has been sent to the super admin team.');
      setShowForgotModal(false);
      setSupportForm({ name: '', email: '', collegeName: '', username: '', message: '' });
    } catch (error) {
      console.error('Support request error:', error);
      toast.error(error.response?.data?.error || 'Failed to send support request');
    } finally {
      setSupportLoading(false);
    }
  };

  // Show Super Admin Login
  if (showSuperAdminLogin) {
    return (
      <div className="role-gate">
        <div className="role-card">
          <div style={{ textAlign: 'left' }}>
            <span style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '13px' }} onClick={backToChoice}>
              <FaArrowLeft /> Back
            </span>
          </div>
          <div className="logo-mark"><FaServer /></div>
          <h2>Super Admin Login</h2>
          <p className="subtitle">Platform-level access — manage colleges & admin accounts</p>
          
          {loginError && (
            <div style={{ 
              background: 'rgba(220,53,69,0.08)', 
              color: 'var(--danger)', 
              padding: '10px 14px', 
              borderRadius: '10px', 
              fontSize: '13px', 
              marginBottom: '16px',
              border: '1px solid rgba(220,53,69,0.2)'
            }}>
              <FaEye style={{ marginRight: '6px' }} /> {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>Username</label>
              <input 
                type="text" 
                id="loginUser"
                placeholder="Enter username"
                defaultValue="superadmin"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }} 
                disabled={loading}
              />
            </div>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                id="loginPass"
                placeholder="Enter password"
                defaultValue="super123"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }} 
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
              {loading ? 'Logging in...' : <><FaServer /> Login as Super Admin</>}
            </button>
          </form>
          <p style={{ fontSize: '11px', color: '#adb5bd', marginTop: '18px' }}>
            Default: superadmin / super123
          </p>
        </div>
      </div>
    );
  }

  // Show Admin/TPO Login
  if (showAdminLogin) {
    return (
      <div className="role-gate">
        <div className="role-card">
          <div style={{ textAlign: 'left' }}>
            <span style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '13px' }} onClick={backToChoice}>
              <FaArrowLeft /> Back
            </span>
          </div>
          <div className="logo-mark"><FaGraduationCap /></div>
          <h2>Admin / TPO Login</h2>
          <p className="subtitle">Sign in to manage your college's placement data</p>
          
          {loginError && (
            <div style={{ 
              background: 'rgba(220,53,69,0.08)', 
              color: 'var(--danger)', 
              padding: '10px 14px', 
              borderRadius: '10px', 
              fontSize: '13px', 
              marginBottom: '16px',
              border: '1px solid rgba(220,53,69,0.2)'
            }}>
              <FaEye style={{ marginRight: '6px' }} /> {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>Username</label>
              <input 
                type="text" 
                id="loginUser"
                placeholder="Enter your username"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }} 
                disabled={loading}
              />
            </div>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                id="loginPass"
                placeholder="Enter your password"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }} 
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
              {loading ? 'Logging in...' : <><FaUserShield /> Login as Admin</>}
            </button>
          </form>
          
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6c757d' }}>
              Don't have an account?{' '}
              <span 
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
                onClick={goToRegistration}
              >
                <FaSchool style={{ marginRight: '4px' }} /> Register your college
              </span>
            </span>
          </div>

          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <span
              style={{ fontSize: '13px', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => setShowForgotModal(true)}
            >
              Forgot credentials? Contact Super Admin
            </span>
          </div>
          
          <p style={{ fontSize: '11px', color: '#adb5bd', marginTop: '12px' }}>
            Contact your Super Admin for credentials
          </p>
        </div>
      </div>
    );
  }

  {showForgotModal && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }} onClick={() => setShowForgotModal(false)}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Forgot Credentials?</h3>
          <button className="btn btn-outline" onClick={() => setShowForgotModal(false)}>Close</button>
        </div>
        <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '16px' }}>Send your issue to the super admin team and they will help you recover access.</p>
        <form onSubmit={handleForgotCredentials}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Your Name</label>
            <input type="text" value={supportForm.name} onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px' }} required />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Email</label>
            <input type="email" value={supportForm.email} onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px' }} required />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>College Name</label>
            <input type="text" value={supportForm.collegeName} onChange={(e) => setSupportForm({ ...supportForm, collegeName: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Username</label>
            <input type="text" value={supportForm.username} onChange={(e) => setSupportForm({ ...supportForm, username: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Describe the issue</label>
            <textarea value={supportForm.message} onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })} rows="4" style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px', resize: 'vertical' }} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={supportLoading}>
            {supportLoading ? 'Sending...' : 'Send to Super Admin'}
          </button>
        </form>
      </div>
    </div>
  )}

  // MAIN LOGIN SCREEN
  return (
    <div className="role-gate">
      <div className="role-card">
        <div className="logo-mark"><FaGraduationCap /></div>
        <h2>CampusPlacement AI</h2>
        <p className="subtitle">Choose how you'd like to continue</p>
        
        <div className="role-options">
          <button className="role-option-btn admin" onClick={() => setShowAdminLogin(true)}>
            <div className="role-option-icon"><FaUserShield /></div>
            <div className="role-option-text">
              <h4>Admin / TPO Login</h4>
              <p>Full access — manage data & run predictions</p>
            </div>
          </button>
          
          <button className="role-option-btn guest" onClick={continueAsGuest}>
            <div className="role-option-icon"><FaEye /></div>
            <div className="role-option-text">
              <h4>Continue as Parent / Student</h4>
              <p>No login needed — view-only access</p>
            </div>
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '20px 0',
          gap: '10px'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e9ecef' }} />
          <span style={{ fontSize: '12px', color: '#6c757d' }}>New here?</span>
          <div style={{ flex: 1, height: '1px', background: '#e9ecef' }} />
        </div>

        <button 
          className="role-option-btn" 
          onClick={goToRegistration}
          style={{ 
            borderColor: 'var(--accent)',
            background: 'rgba(0,180,216,0.05)'
          }}
        >
          <div className="role-option-icon" style={{ background: 'linear-gradient(135deg, var(--teal), var(--accent))' }}>
            <FaSchool />
          </div>
          <div className="role-option-text">
            <h4>Register New College</h4>
            <p>Sign up your college for CampusPlacement AI platform</p>
          </div>
        </button>

        <span 
          className="super-admin-link" 
          style={{ 
            display: 'block', 
            marginTop: '16px', 
            fontSize: '12px', 
            color: '#adb5bd', 
            cursor: 'pointer', 
            textAlign: 'center' 
          }} 
          onClick={() => setShowSuperAdminLogin(true)}
        >
          <FaServer style={{ marginRight: '6px' }} /> Super Admin Login (platform team)
        </span>
      </div>
    </div>
  );
};

export default RoleGate;
