import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from '@/userdashbaord/UserDashboard';
import CreateResume from '@/userdashbaord/Pages/CreateResume'; // Assuming this exports the ResumeBuilder component

const Userroutes = () => {
  return (
    <Routes>
      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      
      {/* /user/dashboard */}
      <Route path="dashboard" element={<UserDashboard />} />
      
      {/* /user/create-resume (For new) OR /user/create-resume/:id (For editing existing) */}
      <Route path="create-resume/:id?" element={<CreateResume />} />
      
    </Routes>
  );
};

export default Userroutes;