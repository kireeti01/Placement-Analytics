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
      setRequestStatus('pending');
      // Only show success message
      toast.success('Registration request submitted successfully!');
      toast.info('Super Admin will review your request shortly.');
      
      // Clear form
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
      // Only show error if it's not a success
      if (error.response?.status !== 201) {
        toast.error(error.response?.data?.error || 'Failed to submit registration');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component remains the same
