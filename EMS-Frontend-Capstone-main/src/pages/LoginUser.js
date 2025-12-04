import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../auth/AuthProvider";
import Toast from "../components/Toast";
import GradientBackground from "../components/GradientBackground";
import { FiUser, FiLock, FiEye, FiEyeOff, FiBriefcase, FiArrowLeft, FiKey, FiShield } from "react-icons/fi";

export default function LoginUser() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  
  // Login State
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotData, setForgotData] = useState({ securityKey: "", newPassword: "" });
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    // Reset toast state after 3 seconds
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleChange = (e) =>
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // --- LOGIN SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/user/login", credentials);
      loginWithToken(res.data);
      showToast("Login successful", "success");
      setTimeout(() => navigate("/user-dashboard"), 700);
    } catch (error) {
      showToast("Invalid username or password", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD SUBMIT ---
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", forgotData);
      
      showToast("Password Reset Successful! Please login.", "success");
      
      setShowForgot(false);
      setForgotData({ securityKey: "", newPassword: "" });
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid Security Key (Check Username + BirthYear)";
      showToast(errorMsg, "error");
    }
  };

  return (
    <GradientBackground type="dashboard">
      <div className="relative z-[60]">
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      </div>
      
      
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
           <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
              <button onClick={() => setShowForgot(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
              
              <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-400">
                      <FiKey size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Reset Password</h2>
                  <p className="text-slate-400 text-sm mt-1">Enter your Security Key to verify identity</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                  
                  {/* SECURITY KEY INPUT ONLY */}
                  <div className="space-y-1">
                     <label className="text-xs text-slate-400 font-semibold uppercase">Security Key</label>
                     <div className="relative">
                        <FiShield className="absolute left-3 top-3 text-slate-500" />
                        <input className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-blue-500" 
                            
                            placeholder="Format: username + YYYY (e.g. bbk2004)"
                            value={forgotData.securityKey} onChange={e => setForgotData({...forgotData, securityKey: e.target.value})} required />
                     </div>
                     
                     <p className="text-xs text-slate-500 mt-1">
                        Combine your Username and Birth Year (e.g. if username is 'bhaswanth' and year is 2004, enter 'bhaswanth2004')
                     </p>
                  </div>

                  {/* NEW PASSWORD */}
                  <div className="space-y-1">
                     <label className="text-xs text-slate-400 font-semibold uppercase">New Password</label>
                     <div className="relative">
                        <FiLock className="absolute left-3 top-3 text-slate-500" />
                        <input className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-blue-500" type="password" placeholder="Enter new password"
                            value={forgotData.newPassword} onChange={e => setForgotData({...forgotData, newPassword: e.target.value})} required />
                     </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors mt-2">
                      Reset Password
                  </button>
              </form>
           </div>
        </div>
      )}

      {/* --- MAIN LOGIN CARD --- */}
      <div className="flex items-center justify-center min-h-[80vh] px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
          
          
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-6 transition-colors font-medium">
            <FiArrowLeft /> Back to Home
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <FiBriefcase className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Employee Login</h2>
            <p className="text-slate-400 text-sm">Access your personal dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors text-lg" />
              <input
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                placeholder="Username (e.g. john.doe)"
                className="w-full bg-black/20 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors text-lg" />
              <input
                type={visible ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full bg-black/20 border border-white/10 text-white pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {visible ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="text-right -mt-2">
                
                <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Forgot Password?
                </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-white/5">
            
            <p className="text-slate-500 text-base">
              Administrator?{" "}
              <span 
                className="text-blue-400 font-medium cursor-pointer hover:text-blue-300 transition-colors" 
                onClick={() => navigate("/admin-login")}
              >
                Admin Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}