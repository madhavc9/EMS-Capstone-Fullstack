import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { FiLayers, FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi"; 
import { useAuth } from "../auth/AuthProvider"; 

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); 
  
  // Get Auth State
  const { isAuthenticated, role, logout } = useAuth();

  const displayRole = role ? role.replace("ROLE_", "") : "User";

  const hideOnRoutes = ["dashboard", "employees", "profile"];
  const shouldHide = hideOnRoutes.some((route) => location.pathname.includes(route));

  if (shouldHide) return null;

  const handleLogout = () => {
      logout();
      setIsOpen(false);
      navigate("/");
  };

  const handleDashboardClick = () => {
      setIsOpen(false);
      if (role === "ROLE_ADMIN") navigate("/admin-dashboard");
      else navigate("/user-dashboard");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
      <div className="max-w-6xl mx-auto h-20 flex items-center justify-between px-6">
        
        
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <FiLayers className="text-xl" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            EMS <span className="text-indigo-400">Portal</span>
          </span>
        </Link>

        
        <div className="hidden md:flex items-center gap-6">
            {isAuthenticated() ? (
                
                <div className="flex items-center gap-4">
                    <div className="text-right hidden lg:block">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Logged in as</p>
                        <p className="text-sm font-bold text-indigo-400">{displayRole}</p>
                    </div>
                    
                    <button 
                        onClick={handleDashboardClick}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
                    >
                        Dashboard
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500 hover:text-white transition-all"
                    >
                        <FiLogOut /> Logout
                    </button>
                </div>
            ) : (
                
                <>
                    <Link 
                      to="/login" 
                      className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      User Login
                    </Link>
                    
                    <Link 
                      to="/admin-login" 
                      className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 hover:border-indigo-500/30 transition-all shadow-sm"
                    >
                      Admin Access
                    </Link>
                </>
            )}
        </div>

        
        <button 
          className="md:hidden text-white text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#0F172A] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-slide-in">
           
           {isAuthenticated() ? (
               
               <>
                   <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                       <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white"><FiUser /></div>
                       <div>
                           <p className="text-xs text-slate-400">Currently logged in as</p>
                           <p className="text-white font-bold">{displayRole}</p>
                       </div>
                   </div>
                   
                   <button 
                      onClick={handleDashboardClick}
                      className="text-center w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-lg"
                   >
                      Go to Dashboard
                   </button>

                   <button 
                      onClick={handleLogout}
                      className="text-center w-full py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                   >
                      Logout
                   </button>
               </>
           ) : (
               
               <>
                   <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="text-center w-full py-3 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      User Login
                    </Link>
                    
                    <Link 
                      to="/admin-login" 
                      onClick={() => setIsOpen(false)}
                      className="text-center w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg"
                    >
                      Admin Access
                    </Link>
               </>
           )}
        </div>
      )}
    </nav>
  );
}