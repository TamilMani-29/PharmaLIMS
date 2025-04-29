import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import ProductList from './components/products/ProductList';
import ProductDetails from './components/products/ProductDetails';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import AuthLayout from './components/auth/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function Routes() {
  return (
    <RouterRoutes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Protected routes */}
      <Route path="/products" element={
        <ProtectedRoute>
          <ProductList />
        </ProtectedRoute>
      } />
      <Route path="/products/:productId/*" element={
        <ProtectedRoute>
          <ProductDetails />
        </ProtectedRoute>
      } />
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </RouterRoutes>
  );
}