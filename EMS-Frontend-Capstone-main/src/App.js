import React from "react";
import { Routes, Route } from "react-router-dom";

import Nav from "./components/Nav";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import Unauthorized from "./pages/Unauthorized";
import Protected from "./auth/Protected";

export default function App() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Nav />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Footer />
            </>
          }
        />

        {/* LOGIN */}
        <Route path="/login" element={<LoginUser />} />
        <Route path="/admin-login" element={<LoginAdmin />} />

        {/* DASHBOARDS */}
        <Route
          path="/user-dashboard"
          element={
            <Protected requiredRole="ROLE_USER">
              <UserDashboard />
            </Protected>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <Protected requiredRole="ROLE_ADMIN">
              <AdminDashboard />
            </Protected>
          }
        />

        {/* ERROR PAGE */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </div>
  );
}