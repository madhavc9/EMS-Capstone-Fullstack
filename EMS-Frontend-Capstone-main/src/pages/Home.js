import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCounter from "../hooks/useCounter";
import FrostedCard from "../components/FrostedCard";
import GradientBackground from "../components/GradientBackground";
import { FiArrowRight, FiUsers, FiBarChart2, FiLock } from "react-icons/fi";
import api from "../services/api"; 
import { useAuth } from "../auth/AuthProvider"; 

// Helper Component
const StatDisplay = ({ target, prefix = "", suffix = "" }) => {
  const count = useCounter(target, 2000); 
  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth(); 
  const [timerKey, setTimerKey] = useState(0);
  
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newJoinees: 0,
    avgSalary: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/public/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch public stats", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerKey((prev) => prev + 1);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  //NAVIGATION LOGIC
  const handleGetStarted = () => {
    if (isAuthenticated()) {
        if (role === "ROLE_ADMIN") {
            navigate("/admin-dashboard");
        } else {
            navigate("/user-dashboard");
        }
    } else {
        navigate("/login"); 
    }
  };

  return (
    <GradientBackground type="dashboard">
      <div className="max-w-6xl mx-auto py-8">
        
        {/* HERO SECTION */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
              ✨ The Future of HR Management
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Manage your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Workforce
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Streamline your employee data, manage roles, and track organizational growth in one unified, secure workspace.
            </p>

            <div className="flex gap-4 pt-2">
              
              <button
                onClick={handleGetStarted}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all flex items-center gap-2"
              >
                {isAuthenticated() ? "Go to Dashboard" : "Get Started"} <FiArrowRight />
              </button>
            </div>
          </div>
          
          
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-900/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <FrostedCard className="relative z-10 p-8 border-white/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white text-lg font-semibold">Live Overview</h3>
                  <p className="text-slate-400 text-sm">Real-time system metrics</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              </div>

              {/* STATS WITH REAL DATA */}
              <div className="space-y-4" key={timerKey}>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                    <FiUsers size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      <StatDisplay target={stats.totalEmployees} />
                    </p>
                    <p className="text-xs text-slate-400">Total Employees</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-2xl font-bold text-white">
                      <StatDisplay target={stats.newJoinees} prefix="+" />
                    </p>
                    <p className="text-xs text-slate-400">New (30d)</p>
                  </div>
                  <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xl font-bold text-emerald-400">
                      <StatDisplay target={stats.avgSalary} prefix="₹" />
                    </p>
                    <p className="text-xs text-slate-400">Avg Salary</p>
                  </div>
                </div>
              </div>
            </FrostedCard>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          <FeatureCard 
            icon={<FiLock />}
            title="Secure Access"
            desc="Role-based security ensuring data privacy for admins and employees."
          />
          <FeatureCard 
            icon={<FiUsers />}
            title="Employee Directory"
            desc="Searchable database of all your team members with key contact info."
          />
          <FeatureCard 
            icon={<FiBarChart2 />}
            title="Smart Insights"
            desc="Visual breakdown of salaries, designations, and headcount growth."
          />
        </div>

      </div>
    </GradientBackground>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default group">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}