import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../auth/AuthProvider";
import Toast from "../components/Toast";
import GradientBackground from "../components/GradientBackground";
import { FiUser, FiLock, FiEye, FiEyeOff, FiShield, FiArrowLeft } from "react-icons/fi";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2000);
  };

  const handleChange = (e) =>
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", credentials);
      loginWithToken(res.data);
      showToast("Welcome back, Admin", "success");
      setTimeout(() => navigate("/admin-dashboard"), 700);
    } catch (error) {
      showToast("Invalid admin credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground type="dashboard">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      <div className="flex items-center justify-center min-h-[80vh] px-4 relative">
        
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
          
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-6 transition-colors">
            <FiArrowLeft /> Back to Home
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <FiShield className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
            <p className="text-slate-400 text-sm">Secure access for system administrators</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username Input */}
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                placeholder="Username"
                className="w-full bg-black/20 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={visible ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full bg-black/20 border border-white/10 text-white pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {visible ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-white/5">
            <p className="text-slate-500 text-sm">
              Not an admin?{" "}
              <span 
                className="text-purple-400 font-medium cursor-pointer hover:text-purple-300 transition-colors" 
                onClick={() => navigate("/login")}
              >
                Employee Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}