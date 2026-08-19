import React, { createContext, useState, useContext, useEffect } from 'react';
import { studentAPI, dashboardAPI, placementAPI } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const emptyStats = {
    total: 0,
    placed: 0,
    unplaced: 0,
    atRisk: 0,
    placementRate: 0,
    avgPackage: '0 LPA',
    highestPackage: '0 LPA'
  };
  const [stats, setStats] = useState(emptyStats);

  const clearContextData = () => {
    setStudents([]);
    setPlacements([]);
    setStats(emptyStats);
  };

  const loadStudents = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearContextData();
      return [];
    }
    
    setLoading(true);
    try {
      const response = await studentAPI.getAll();
      const data = response.data || [];
      setStudents(data);
      return data;
    } catch (error) {
      console.error('Failed to load students:', error);
      setStudents([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearContextData();
      return null;
    }
    
    try {
      const response = await dashboardAPI.getStats();
      if (response.data && response.data.stats) {
        const apiStats = response.data.stats;
        setStats({
          total: apiStats.totalStudents ?? 0,
          placed: apiStats.placedStudents ?? 0,
          unplaced: apiStats.unplacedStudents ?? 0,
          atRisk: apiStats.atRiskStudents ?? 0,
          placementRate: apiStats.placementRate ?? 0,
          avgPackage: apiStats.avgPackage ?? '0 LPA',
          highestPackage: apiStats.highestPackage ?? '0 LPA'
        });
      }
      return response.data;
    } catch (error) {
      console.error('Failed to load stats:', error);
      return null;
    }
  };

  const loadPlacements = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearContextData();
      return [];
    }

    try {
      const response = await placementAPI.getAll();
      const data = response.data || [];
      setPlacements(data);
      return data;
    } catch (error) {
      console.error('Failed to load placements:', error);
      setPlacements([]);
      return [];
    }
  };

  const refreshData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearContextData();
      return;
    }
    await loadStudents();
    await loadStats();
    await loadPlacements();
  };

  useEffect(() => {
    const syncSession = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        clearContextData();
        return;
      }
      refreshData();
    };

    syncSession();
    window.addEventListener('app:token-changed', syncSession);
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener('app:token-changed', syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const addStudent = async (student) => {
    try {
      const response = await studentAPI.create(student);
      setStudents(prev => [...prev, response.data]);
      await loadStats();
      toast.success('✅ Student added successfully!');
      return response.data;
    } catch (error) {
      console.error('Add student error:', error);
      toast.error(error.response?.data?.error || 'Failed to add student');
      throw error;
    }
  };

  // Bulk add students (CSV upload) - CLEAN TOAST VERSION
  const addBulkStudents = async (newStudents) => {
    if (!newStudents || newStudents.length === 0) {
      toast.error('No students to upload');
      return;
    }

    setIsUploading(true);
    console.log(`📤 Uploading ${newStudents.length} students...`);

    try {
      const response = await studentAPI.bulkCreate(newStudents);
      console.log('✅ Bulk upload response:', response.data);
      
      await loadStudents();
      await loadStats();
      
      if (response.data) {
        const { success, skipped, failed, skipped_details, errors } = response.data;
        
        // Build a single comprehensive message
        let message = '';
        let hasSuccess = false;
        let hasWarning = false;
        let hasError = false;
        let showSuccess = false;
        
        if (success > 0) {
          message += `✅ ${success} students added successfully!`;
          hasSuccess = true;
          showSuccess = true;
        }
        
        if (skipped > 0) {
          if (message) message += ' ';
          message += `⏭️ ${skipped} students skipped (duplicate roll numbers)`;
          hasWarning = true;
          
          // Log skipped details to console only
          if (skipped_details && skipped_details.length > 0) {
            console.log('⏭️ Skipped students:', skipped_details);
          }
        }
        
        if (failed > 0) {
          if (message) message += ' ';
          message += `❌ ${failed} students failed to add`;
          hasError = true;
          
          // Log errors to console only
          if (errors && errors.length > 0) {
            console.error('❌ Errors during bulk upload:', errors);
          }
        }
        
        // Show SINGLE toast based on the result
        if (showSuccess && !hasError) {
          toast.success(message);
        } else if (showSuccess && hasError) {
          toast.success(message);
        } else if (hasWarning && !showSuccess && !hasError) {
          toast.warning(message);
        } else if (hasError && !showSuccess) {
          toast.error(message);
        } else if (message) {
          toast(message);
        }
        
        // If no students were processed at all
        if (success === 0 && skipped === 0 && failed === 0) {
          toast.error('No students were processed. Please check the CSV format.');
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Bulk add error:', error);
      toast.error('❌ ' + (error.response?.data?.error || 'Failed to upload students'));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const updateStudent = async (id, updatedData) => {
    try {
      const response = await studentAPI.update(id, updatedData);
      setStudents(prev => prev.map(s => s.id === id ? response.data : s));
      await loadStats();
      toast.success('✅ Student updated successfully!');
      return response.data;
    } catch (error) {
      console.error('Update student error:', error);
      toast.error(error.response?.data?.error || 'Failed to update student');
      throw error;
    }
  };

  const deleteStudent = async (id) => {
    try {
      await studentAPI.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      await loadStats();
      toast.success('✅ Student deleted successfully!');
    } catch (error) {
      console.error('Delete student error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete student');
      throw error;
    }
  };

  const getStats = () => stats;

  const getBranchStats = () => {
    const branches = {};
    students.forEach(s => {
      const branch = s.branch || 'Unknown';
      if (!branches[branch]) {
        branches[branch] = { total: 0, placed: 0, unplaced: 0, atRisk: 0 };
      }
      branches[branch].total++;
      if (s.placement_status === 'placed') branches[branch].placed++;
      else if (s.placement_status === 'unplaced') branches[branch].unplaced++;
      else if (s.placement_status === 'at_risk') branches[branch].atRisk++;
    });
    return branches;
  };

  const getCareerStats = () => {
    const placed = students.filter(s => s.placement_status === 'placed').length;
    const unplaced = students.filter(s => s.placement_status === 'unplaced').length;
    const atRisk = students.filter(s => s.placement_status === 'at_risk').length;
    return { placed, unplaced, atRisk, total: students.length };
  };

  const getCompanyStats = () => {
    const companies = {};
    students.filter(s => s.placement_status === 'placed' && s.company).forEach(s => {
      if (!companies[s.company]) {
        companies[s.company] = { count: 0, totalPackage: 0 };
      }
      companies[s.company].count++;
      const pkg = parseFloat(s.package?.replace(/[^0-9.]/g, ''));
      if (!isNaN(pkg)) companies[s.company].totalPackage += pkg;
    });
    return companies;
  };

  const value = {
    students,
    placements,
    loading,
    isUploading,
    stats,
    loadStudents,
    loadStats,
    loadPlacements,
    refreshData,
    clearContextData,
    addStudent,
    addBulkStudents,
    updateStudent,
    deleteStudent,
    getStats,
    getBranchStats,
    getCareerStats,
    getCompanyStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};