import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaClock, FaSchool } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { collegeAPI } from '../services/api';

const SuperAdminCollegeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await collegeAPI.getRequests();
      console.log('✅ Requests loaded from API:', response.data);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (filter === 'all') return requests;
    return requests.filter(r => r.status === filter);
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Approve this college registration?')) return;

    try {
      const response = await collegeAPI.approve(requestId);
      toast.success('College approved! Credentials generated.');
      loadRequests(); // Reload the list
      setSelectedRequest(null);
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Reject this college registration?')) return;

    try {
      await collegeAPI.reject(requestId);
      toast.success('College rejected');
      loadRequests(); // Reload the list
      setSelectedRequest(null);
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.error || 'Failed to reject');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    return 'badge-warning';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <FaCheck />;
    if (status === 'rejected') return <FaTimes />;
    return <FaClock />;
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading requests...</div>;
  }

  return (
    <div className="dashboard-section active">
      <div className="ai-insights-banner">
        <h2><FaSchool /> College Registration Requests</h2>
        <p>Review and manage college registration requests from TPOs</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px' }}>
            Total: {requests.length}
          </span>
          <span style={{ background: 'rgba(255,193,7,0.3)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px' }}>
            Pending: {pendingCount}
          </span>
          <span style={{ background: 'rgba(40,167,69,0.3)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px' }}>
            Approved: {requests.filter(r => r.status === 'approved').length}
          </span>
          <span style={{ background: 'rgba(220,53,69,0.3)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px' }}>
            Rejected: {requests.filter(r => r.status === 'rejected').length}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className={filter === 'all' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={filter === 'pending' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setFilter('pending')}>
          Pending
        </button>
        <button className={filter === 'approved' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setFilter('approved')}>
          Approved
        </button>
        <button className={filter === 'rejected' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setFilter('rejected')}>
          Rejected
        </button>
        <span style={{ fontSize: '13px', color: '#6c757d', alignSelf: 'center' }}>
          Showing {getFilteredRequests().length} requests
        </span>
        <button className="btn btn-outline" onClick={loadRequests} style={{ marginLeft: 'auto' }}>
          Refresh
        </button>
      </div>

      <div className="table-card">
        <div className="table-header"><h3>Registration Requests</h3></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>College</th>
              <th>Code</th>
              <th>Admin</th>
              <th>Email</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredRequests().length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  {loading ? 'Loading...' : 'No registration requests found.'}
                </td>
              </tr>
            ) : (
              getFilteredRequests().map((req) => (
                <tr key={req.id}>
                  <td><strong>{req.college_name}</strong></td>
                  <td>{req.college_code}</td>
                  <td>{req.admin_name}</td>
                  <td>{req.admin_email}</td>
                  <td>{new Date(req.createdAt || req.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <span className={'badge ' + getStatusColor(req.status)}>
                      {getStatusIcon(req.status)} {req.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '4px 8px', marginRight: '6px' }} 
                      onClick={() => setSelectedRequest(req)}
                    >
                      <FaEye /> View
                    </button>
                    {req.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '4px 8px', marginRight: '6px', color: 'var(--success)' }} 
                          onClick={() => handleApprove(req.id)}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '4px 8px', color: 'var(--danger)' }} 
                          onClick={() => handleReject(req.id)}
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedRequest(null)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2><FaSchool /> {selectedRequest.college_name}</h2>
              <button className="btn btn-outline" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>College Code:</strong> {selectedRequest.college_code}</div>
              <div><strong>Established:</strong> {selectedRequest.established_year || 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedRequest.address || 'N/A'}</div>
              <div><strong>City:</strong> {selectedRequest.city || 'N/A'}</div>
              <div><strong>State:</strong> {selectedRequest.state || 'N/A'}</div>
              <div><strong>Phone:</strong> {selectedRequest.phone || 'N/A'}</div>
              <div><strong>Email:</strong> {selectedRequest.email || 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Website:</strong> {selectedRequest.website || 'N/A'}</div>
            </div>

            <hr style={{ margin: '16px 0' }} />

            <h4>Admin Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div><strong>Name:</strong> {selectedRequest.admin_name}</div>
              <div><strong>Email:</strong> {selectedRequest.admin_email}</div>
              <div><strong>Phone:</strong> {selectedRequest.admin_phone || 'N/A'}</div>
            </div>

            {selectedRequest.message && (
              <>
                <hr style={{ margin: '16px 0' }} />
                <div>
                  <strong>Message:</strong>
                  <p style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                    {selectedRequest.message}
                  </p>
                </div>
              </>
            )}

            <hr style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <span className={'badge ' + getStatusColor(selectedRequest.status)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                {getStatusIcon(selectedRequest.status)} Status: {selectedRequest.status}
              </span>
              {selectedRequest.status === 'pending' && (
                <>
                  <button className="btn btn-success" onClick={() => handleApprove(selectedRequest.id)}>
                    <FaCheck /> Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => handleReject(selectedRequest.id)}>
                    <FaTimes /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCollegeRequests;
