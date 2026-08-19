import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSchool, FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { collegeAPI } from '../services/api';

const CollegeRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    college_name: '',
    college_code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    established_year: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.college_name || !formData.college_code || !formData.admin_email || !formData.admin_name) {
      toast.error('Please fill all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await collegeAPI.register(formData);
      console.log('Registration response:', response);
      
      setRequestStatus('pending');
      toast.success('Registration request submitted successfully!');
      
      setFormData({
        college_name: '',
        college_code: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        website: '',
        established_year: '',
        admin_name: '',
        admin_email: '',
        admin_phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response && (error.response.status === 201 || error.response.status === 200)) {
        setRequestStatus('pending');
        toast.success('Registration request submitted successfully!');
      } else {
        const errorMsg = error.response?.data?.error || 'Failed to submit registration';
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  const getStatusBadge = () => {
    if (!requestStatus) return null;
    switch(requestStatus) {
      case 'pending':
        return <span className="badge badge-warning"><FaClock /> Pending Review</span>;
      case 'approved':
        return <span className="badge badge-success"><FaCheckCircle /> Approved</span>;
      case 'rejected':
        return <span className="badge badge-danger"><FaTimesCircle /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e8f4f8 0%, #d1e7dd 100%)',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{ maxWidth: '900px', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <button 
            className="btn btn-outline" 
            onClick={goBack}
            style={{ padding: '10px 20px', background: 'white' }}
          >
            <FaArrowLeft /> Back to Login
          </button>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #00b4d8 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,180,216,0.2)'
        }}>
          <h2><FaSchool /> College Registration</h2>
          <p>Register your college to start using CampusPlacement AI platform</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '30px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <h3>Registration Request</h3>
            <p style={{ color: '#6c757d', fontSize: '13px', marginBottom: '16px' }}>
              Fill this form to request college registration. Super Admin will review and approve.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>College Name *</label>
                <input
                  type="text"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  placeholder="e.g., Vishnu Institute of Technology"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>College Code *</label>
                  <input
                    type="text"
                    name="college_code"
                    value={formData.college_code}
                    onChange={handleChange}
                    placeholder="e.g., VITB"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Established Year</label>
                  <input
                    type="number"
                    name="established_year"
                    value={formData.established_year}
                    onChange={handleChange}
                    placeholder="e.g., 2001"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="College address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="College phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>College Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="college@example.com"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="www.college.edu"
                />
              </div>

              <hr style={{ margin: '20px 0', border: '1px solid #e9ecef' }} />

              <h4 style={{ marginBottom: '16px' }}>Admin Details</h4>

              <div className="form-group">
                <label>Admin Name *</label>
                <input
                  type="text"
                  name="admin_name"
                  value={formData.admin_name}
                  onChange={handleChange}
                  placeholder="TPO/TNP Officer Name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Admin Email *</label>
                  <input
                    type="email"
                    name="admin_email"
                    value={formData.admin_email}
                    onChange={handleChange}
                    placeholder="admin@college.edu"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Admin Phone</label>
                  <input
                    type="text"
                    name="admin_phone"
                    value={formData.admin_phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Additional Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any additional information..."
                  rows="3"
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '14px' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration Request'}
              </button>
            </form>
          </div>

          <div>
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              marginBottom: '20px'
            }}>
              <h3>Registration Process</h3>
              <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ background: 'var(--accent)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</span>
                  <div>
                    <h4 style={{ fontSize: '14px' }}>Submit Request</h4>
                    <p style={{ fontSize: '12px', color: '#6c757d' }}>Fill the registration form with college and admin details</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ background: 'var(--warning)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
                  <div>
                    <h4 style={{ fontSize: '14px' }}>Super Admin Review</h4>
                    <p style={{ fontSize: '12px', color: '#6c757d' }}>Platform team reviews your college registration request</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ background: 'var(--success)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
                  <div>
                    <h4 style={{ fontSize: '14px' }}>Approval & Credentials</h4>
                    <p style={{ fontSize: '12px', color: '#6c757d' }}>College is activated, and you receive login credentials</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ background: 'var(--teal)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</span>
                  <div>
                    <h4 style={{ fontSize: '14px' }}>Start Using Platform</h4>
                    <p style={{ fontSize: '12px', color: '#6c757d' }}>Add students, track placements, and generate reports</p>
                  </div>
                </div>
              </div>
            </div>

            {requestStatus && (
              <div style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '24px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <h3>Request Status</h3>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  {getStatusBadge()}
                  <p style={{ marginTop: '12px', fontSize: '13px', color: '#6c757d' }}>
                    Your request has been submitted. Super Admin will review it shortly.
                  </p>
                  <button 
                    className="btn btn-outline" 
                    onClick={goBack}
                    style={{ marginTop: '12px' }}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeRegistration;
