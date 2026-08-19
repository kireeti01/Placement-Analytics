import React from 'react';
import toast from 'react-hot-toast';

const TestToast = () => {
  const testToast = () => {
    toast.success('✅ Success toast works!');
    toast.error('❌ Error toast works!');
    toast('ℹ️ Info toast works!');
  };

  return (
    <button 
      onClick={testToast}
      style={{ 
        padding: '10px 20px', 
        margin: '10px',
        background: '#1e3a5f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      Test Toast Notifications
    </button>
  );
};

export default TestToast;
