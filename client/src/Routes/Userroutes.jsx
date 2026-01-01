import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserDashboard from '@/userdashbaord/UserDashboard';
import CreateResume from '@/userdashbaord/Pages/CreateResume';
import PlanPurchase from '@/userdashbaord/Pages/PlanPurchase';

const Userroutes = () => {
  return (
    <Routes>
      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      {/* /user/dashboard */}
      <Route path="dashboard" element={<UserDashboard />} />

      {/* /user/plans - New Page */}
      <Route path="plans" element={<PlanPurchase />} />

      {/* /user/create-resume */}
      <Route path="create-resume/:id?" element={<CreateResume />} />

    </Routes>
  );
};

export default Userroutes;
