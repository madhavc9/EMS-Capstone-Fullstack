import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";
import api, { experienceApi } from "../services/api";
import { Link } from "react-router-dom";
import { 
  FiUsers, FiUser, FiLogOut, FiSearch, FiMail, FiInfo, FiLayers, 
  FiBriefcase, FiFilter, FiX, FiMenu, FiPieChart, FiClock
} from "react-icons/fi";
import Toast from "../components/Toast";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

export default function UserDashboard() {
  const { logout, employeeId } = useAuth();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("profile"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const [employees, setEmployees] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [myExperience, setMyExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expSearch, setExpSearch] = useState("");
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // --- HELPERS ---
  const showToast = (message, type = "success") => { setToast({ show: true, message, type }); };
  const handleCloseToast = () => { setToast({ ...toast, show: false }); };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); 
  };

  // --- API CALLS ---
  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const empRes = await api.get("/api/employees");
      setEmployees(empRes.data);

      if (employeeId) {
        const profileRes = await api.get("/api/profile/me");
        setMyProfile(profileRes.data);
        
        try {
            const expRes = await experienceApi.get("/api/experience/me");
            setMyExperience(expRes.data);
        } catch (e) {
            console.warn("Experience service unavailable or empty");
            setMyExperience([]);
        }
      }
    } catch (err) {
      console.error("Error fetching data", err);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- PERSONAL ANALYTICS DATA ---
  const userStats = useMemo(() => {
      if (!myExperience.length) return { skills: [], companies: [], totalYears: 0 };
      
      //Skills Distribution
      const skillMap = {};
      let total = 0;
      myExperience.forEach(exp => {
          const stack = exp.techStack || "Other";
          skillMap[stack] = (skillMap[stack] || 0) + exp.years;
          total += exp.years;
      });
      const skillsData = Object.keys(skillMap).map(k => ({ name: k, value: skillMap[k] }));

      // Company Timeline (for Bar Chart)
      const companyData = myExperience.map(exp => ({
          name: exp.company,
          years: exp.years
      }));

      return { skills: skillsData, companies: companyData, totalYears: total.toFixed(1) };
  }, [myExperience]);

  const COLORS = ['#818CF8', '#A78BFA', '#34D399', '#F472B6', '#60A5FA'];

  // --- FILTERS ---
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExperience = myExperience.filter(exp => 
    exp.techStack.toLowerCase().includes(expSearch.toLowerCase()) || 
    exp.company.toLowerCase().includes(expSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#1E293B] via-[#111827] to-[#020617] font-sans text-slate-200 relative">
      
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0F172A] md:bg-white/5 backdrop-blur-lg border-r border-white/10 flex flex-col transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="p-6 flex items-center justify-between gap-3">

  <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
       <FiLayers className="text-xl" />
    </div>
    <span className="text-xl font-bold text-white tracking-tight">
      EMS <span className="text-indigo-400">Portal</span>
    </span>
  </Link>

  <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
    <FiX size={24} />
  </button>
</div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarBtn 
            label="My Profile" 
            icon={<FiUser />} 
            active={activeTab === "profile"} 
            onClick={() => handleTabChange("profile")} 
          />
          <SidebarBtn 
            label="My Experience" 
            icon={<FiBriefcase />} 
            active={activeTab === "experience"} 
            onClick={() => handleTabChange("experience")} 
          />
          <SidebarBtn 
            label="Team Directory" 
            icon={<FiUsers />} 
            active={activeTab === "employees"} 
            onClick={() => handleTabChange("employees")} 
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
            bg-red-500/5 text-red-400/80 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>


      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 px-6 md:px-8 flex items-center justify-between bg-white/5 backdrop-blur-lg border-b border-white/10 z-10">
          
          <div className="flex items-center gap-4">
            
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <FiMenu size={24} />
            </button>

            <h2 className="text-xl md:text-2xl font-semibold text-white truncate">
              {activeTab === "profile" && "My Profile"}
              {activeTab === "experience" && "Work History"}
              {activeTab === "employees" && "Team Directory"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block text-sm">
                <p className="text-white font-medium">{myProfile?.name || "User"}</p>
                <p className="text-indigo-400 text-xs font-semibold">
                  {myProfile?.designation || "Employee"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border border-white/10 shadow-lg">
                {myProfile?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {loading ? (
            <div className="text-white animate-pulse flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce"></div>
                Loading...
            </div>
          ) : (
            <>
              
              
              {activeTab === "profile" && myProfile && (
                <div className="max-w-4xl mx-auto space-y-6">
                   <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

                      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-[#1E293B]">
                            {myProfile.name.charAt(0)}
                          </div>
                          <div className="text-center">
                            <h2 className="text-xl font-bold text-white">{myProfile.name}</h2>
                            <p className="text-indigo-300 text-sm">{myProfile.designation}</p>
                          </div>
                        </div>

                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0F172A]/40 p-6 rounded-xl border border-white/5">
                          <ProfileField label="Employee ID" value={`#${myProfile.id}`} />
                          <ProfileField label="Role" value="Employee" />
                          <ProfileField label="Email" value={myProfile.email} />
                          <ProfileField label="Status" value="Active" />
                          
                          <div className="md:col-span-2 mt-2 pt-4 border-t border-white/5">
                            <label className="text-emerald-400/80 text-xs uppercase tracking-wider font-semibold block mb-1">
                              Current Salary
                            </label>
                            <div className="flex items-end gap-2">
                               <span className="text-2xl font-bold text-emerald-400">
                                 ₹{Number(myProfile.salary).toLocaleString()}
                               </span>
                               <span className="text-slate-500 text-xs mb-1">/ month</span>
                            </div>
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-indigo-400 flex-shrink-0">
                         <FiInfo size={20} />
                       </div>
                       <div>
                         <h3 className="text-white font-medium">Need to update your details?</h3>
                         <p className="text-slate-400 text-sm">Role, Designation and Personal details are managed by Admin.</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 w-full md:w-auto justify-center">
                       <FiMail />
                       <span className="text-sm font-mono">support@emsportal.com</span>
                     </div>
                   </div>
                </div>
              )}

              
              {activeTab === "experience" && (
                <div className="max-w-6xl mx-auto space-y-6">
                    {/*  ANALYTICS SECTION FOR USER */}
                    <div className="grid md:grid-cols-3 gap-6">
                        
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-20 text-white"><FiBriefcase size={80} /></div>
                             <h3 className="text-white/80 font-medium text-sm">Total Experience</h3>
                             <div className="mt-2">
                                 <span className="text-4xl font-bold text-white">{userStats.totalYears}</span>
                                 <span className="text-white/60 text-sm ml-2">Years</span>
                             </div>
                        </div>

                        {/* Skills Chart */}
                        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl h-[180px] flex items-center">
                             <div className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={userStats.skills} layout="vertical" margin={{ left: 20 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                      <XAxis type="number" hide />
                                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 12}} />
                                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                                      <Bar dataKey="value" fill="#34D399" radius={[0, 4, 4, 0]} barSize={20} />
                                   </BarChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="text-slate-400 text-xs font-medium px-4 border-l border-white/10 h-full flex items-center">
                                 Skills Breakdown
                             </div>
                        </div>
                    </div>

                    {/*  LIST SECTION */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                              <FiBriefcase /> Detailed History
                          </h2>
                          <div className="relative w-full max-w-xs">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                placeholder="Filter by Tech or Company..." 
                                value={expSearch}
                                onChange={(e) => setExpSearch(e.target.value)}
                                className="w-full bg-[#0F172A]/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-indigo-500 outline-none"
                            />
                          </div>
                      </div>

                      <div className="space-y-4">
                          {filteredExperience.length === 0 ? (
                              <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                                  No experience records found.
                              </div>
                          ) : (
                              filteredExperience.map(exp => (
                                  <div key={exp.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/10 transition-colors">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-sm">
                                              {exp.company.charAt(0)}
                                          </div>
                                          <div>
                                              <h3 className="text-white font-semibold text-lg">{exp.company}</h3>
                                              <p className="text-indigo-300 text-sm font-medium">{exp.techStack}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <div className="text-right">
                                              <span className="block text-2xl font-bold text-slate-200">{exp.years}</span>
                                              <span className="text-xs text-slate-500 uppercase tracking-wider">Years</span>
                                          </div>
                                          <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                                          <div className="text-slate-400 text-xs font-mono flex items-center gap-1">
                                              </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
                </div>
              )}

              {/* === TAB: TEAM DIRECTORY === */}
              {activeTab === "employees" && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
                  <div className="mb-6 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search colleague..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0F172A]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead className="sticky top-0 bg-[#1E293B] z-10 shadow-sm">
                        <tr>
                          <th className="p-4 text-xs font-semibold text-slate-400 uppercase rounded-tl-lg">ID</th>
                          <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Name</th>
                          <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Email</th>
                          <th className="p-4 text-xs font-semibold text-slate-400 uppercase rounded-tr-lg">Designation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-slate-500 font-mono">#{emp.id}</td>
                            <td className="p-4 text-slate-200">{emp.name}</td>
                            <td className="p-4 text-slate-400">{emp.email}</td>
                            <td className="p-4">
                              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs whitespace-nowrap">
                                {emp.designation}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-slate-500">
                    <span>Showing {filteredEmployees.length} records</span>
                    <span>Total Team: {employees.length}</span>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper Components
function SidebarBtn({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? "bg-white/10 text-white shadow-lg border border-white/5" 
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <label className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">{label}</label>
      <p className="text-slate-200 font-medium text-base break-words">{value}</p>
    </div>
  );
}
