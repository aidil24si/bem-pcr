import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMockDatabase } from '../context/MockDatabaseContext';

export default function ProtectedRoute({ children }) {
  const { session } = useMockDatabase();

  if (!session) {
    // Redirect to login page if no active session
    return <Navigate to="/login" replace />;
  }

  return children;
}
