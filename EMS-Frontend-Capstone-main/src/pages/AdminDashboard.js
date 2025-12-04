import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import api, { experienceApi } from "../services/api";
import Toast from "../components/Toast";
import { Link } from "react-router-dom";
import { 
  FiLayers, FiUsers, FiUserPlus, FiLogOut, FiSearch, 
  FiEdit2, FiTrash2, FiUser, FiArrowLeft, FiSave, FiX, 
  FiMail, FiBriefcase, FiDollarSign, FiShield, FiBarChart2,
  FiCalendar, FiLock, FiTrendingUp, FiAward, FiInfo, FiMenu, 
  FiFilter, FiCheckCircle, FiPlus, FiRefreshCw
} from "react-icons/fi";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";

export default function AdminDashboard() {
  const { logout } = useAuth();
  

  const [view, setView] = useState("list"); 
  const [previousView, setPreviousView] = useState("list"); 
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // --- CANDIDATE SEARCH STATE ---
  const [techTags, setTechTags] = useState([]); 
  const [companyTags, setCompanyTags] = useState([]); 
  const [minYears, setMinYears] = useState("");
  
  const [candidateResults, setCandidateResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [resultLimit, setResultLimit] = useState("all");

  // --- POST-CREATION FLOW STATE ---
  const [newlyCreatedEmployee, setNewlyCreatedEmployee] = useState(null);
  const [showPostCreateModal, setShowPostCreateModal] = useState(false);
  const [showAddExpFlow, setShowAddExpFlow] = useState(false);

  // --- DETAILS & EXPERIENCE STATE ---
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeExperience, setEmployeeExperience] = useState([]);
  const [experienceSummary, setExperienceSummary] = useState([]);
  const [newExp, setNewExp] = useState({ techStack: "", company: "", years: "" });

  // --- FORM STATE ---
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({
    name: "", email: "", designation: "", salary: "", birthDate: "", role: "USER"
  });
  const [formSaving, setFormSaving] = useState(false);

  const adminProfile = {
    id: "HR-001",
    name: "HR Manager",
    email: "hr@ems.com",
    role: "Senior HR Executive",
    designation: "Head of People Ops",
    status: "Active",
    accessLevel: "Admin Access"
  };

  // --- ANALYTICS DATA ---
  const analyticsData = useMemo(() => {
    if (!employees.length) return { designation: [], salary: [], age: [], avgSalary: 0 };
    const desMap = {}; employees.forEach(e => { const des = e.designation || "Unknown"; desMap[des] = (desMap[des] || 0) + 1; });
    const designationData = Object.keys(desMap).map(key => ({ name: key, count: desMap[key] }));
    let s1=0, s2=0, s3=0, totalSal=0; employees.forEach(e => { const sal = Number(e.salary) || 0; totalSal += sal; if (sal < 50000) s1++; else if (sal <= 100000) s2++; else s3++; });
    const salaryData = [{ name: "< 50k", value: s1 }, { name: "50k - 1L", value: s2 }, { name: "> 1L", value: s3 }].filter(i => i.value > 0);
    let a1=0, a2=0, a3=0; const currentYear = new Date().getFullYear(); employees.forEach(e => { if(e.birthDate) { const birthYear = new Date(e.birthDate).getFullYear(); const age = currentYear - birthYear; if(age < 25) a1++; else if(age <= 35) a2++; else a3++; } });
    const ageData = [{ name: "18-24", count: a1 }, { name: "25-35", count: a2 }, { name: "36+", count: a3 }];
    return { designation: designationData, salary: salaryData, age: ageData, avgSalary: employees.length ? (totalSal / employees.length).toFixed(0) : 0 };
  }, [employees]);

  const COLORS = ['#818CF8', '#A78BFA', '#34D399', '#F472B6', '#60A5FA'];

  // --- HELPERS ---
  const showToast = useCallback((message, type = "success") => { setToast({ show: true, message, type }); }, []);
  const handleCloseToast = () => { setToast({ ...toast, show: false }); };
  
  // Helper to close sidebar on click
  const handleViewChange = (newView) => { 
      setView(newView); 
      setIsSidebarOpen(false); 
      setCandidateResults([]); 
      setSearchPerformed(false);
  };

  useEffect(() => { fetchEmployees(); }, []);
  const fetchEmployees = async () => { 
    setLoading(true); try { const res = await api.get("/api/employees"); setEmployees(res.data); } catch (err) { showToast("Failed to load data", "error"); } finally { setLoading(false); } 
  };

  // --- CRUD HANDLERS ---
  const handleDelete = async (id) => { if (!window.confirm("Delete?")) return; setDeleteLoading(id); try { await api.delete(`/api/employees/${id}`); setEmployees(prev => prev.filter(emp => emp.id !== id)); showToast("Deleted", "success"); } catch (err) { showToast("Failed", "error"); } finally { setDeleteLoading(null); } };
  const handleResetCredentials = async () => { if(!editingId) return; if(!window.confirm("Reset password (username$$DD)?")) return; try { await api.post(`/auth/reset-credentials/${editingId}`); showToast("Reset Success", "success"); } catch (err) { showToast("Failed", "error"); } };

  const handleEditClick = async (e, employee) => { 
      e.stopPropagation(); 
      setEditingId(employee.id);
      setSelectedEmployee(employee); 
      setFormData({ name: employee.name, email: employee.email, designation: employee.designation, salary: employee.salary, birthDate: employee.birthDate || "", role: employee.role || "USER" }); 
      try {
        const res = await experienceApi.get(`/api/experience/employee/${employee.id}`);
        setEmployeeExperience(res.data);
      } catch (err) { setEmployeeExperience([]); }
      setView("form"); 
  };
  const handleAddClick = () => { setEditingId(null); setFormData({ name: "", email: "", designation: "", salary: "", birthDate: "", role: "USER" }); setView("form"); };

  const handleFormSubmit = async (e) => { 
    e.preventDefault(); setFormSaving(true); 
    try { 
        if (editingId) { 
            const res = await api.put(`/api/employees/${editingId}`, formData); 
            setEmployees(prev => prev.map(emp => emp.id === editingId ? res.data : emp)); 
            showToast("Updated Successfully", "success"); 
            setView("list");
        } else { 
            const res = await api.post("/api/employees", formData); 
            setEmployees(prev => [...prev, res.data]); 
            setNewlyCreatedEmployee(res.data);
            setShowPostCreateModal(true); 
        } 
    } catch (err) { showToast("Failed", "error"); } 
    finally { setFormSaving(false); } 
  };

  const addExperienceToEmployee = async (empId, expData) => {
      return await experienceApi.post("/api/experience", {
          employeeId: empId, techStack: expData.techStack, company: expData.company, years: parseInt(expData.years) 
      });
  };

  const handleAddExperienceInsideEdit = async (e) => {
    e.preventDefault();
    if(!newExp.techStack || !newExp.company || !newExp.years) return;
    try {
        const res = await addExperienceToEmployee(editingId, newExp); 
        setEmployeeExperience([...employeeExperience, res.data]);
        setNewExp({ techStack: "", company: "", years: "" });
        showToast("Experience Added", "success");
    } catch (err) { showToast("Failed to add experience", "error"); }
  };

  const handleDeleteExperience = async (expId) => {
    if(!window.confirm("Remove record?")) return;
    try {
        await experienceApi.delete(`/api/experience/${expId}?employeeId=${editingId}`);
        setEmployeeExperience(prev => prev.filter(e => e.id !== expId));
        showToast("Removed", "success");
    } catch (err) { showToast("Failed", "error"); }
  };

  const handleSkipExperience = () => { setShowPostCreateModal(false); setShowAddExpFlow(false); setNewlyCreatedEmployee(null); showToast("Employee created!", "success"); setView("list"); };
  const handleStartAddExperience = () => { setShowPostCreateModal(false); setShowAddExpFlow(true); };
  const handleAddExperienceLoop = async (e) => {
      e.preventDefault();
      try { await addExperienceToEmployee(newlyCreatedEmployee.id, newExp); showToast("Record Added!", "success"); setNewExp({ techStack: "", company: "", years: "" }); } catch (err) { showToast("Failed", "error"); }
  };

  // --- CANDIDATE SEARCH LOGIC ---
  const handleCandidateSearch = async (e) => {
      e.preventDefault();

      // VALIDATION: Error if only years provided without context
      if (techTags.length === 0 && companyTags.length === 0 && minYears) {
          showToast("Error: Cannot search by Experience alone. Please add Tech or Company.", "error");
          return;
      }
      if (techTags.length === 0 && companyTags.length === 0 && !minYears) {
          showToast("Please add filters.", "error");
          return;
      }

      setSearchPerformed(true);
      try {
          // 1. Fetch all data
          const res = await experienceApi.get(`/api/experience/filter`);
          const allExperience = res.data;
          
          const targetYears = parseInt(minYears) || 1;
          
          const results = employees.map(emp => {
             // Get all exp records for this employee
             const empExp = allExperience.filter(exp => exp.employeeId === emp.id);
             if(empExp.length === 0) return null;

             // Tech Stack Match Score
             let techScore = 0;
             let hasTechMatch = false;
             if (techTags.length > 0) {
                 const relevantExp = empExp.filter(exp => techTags.some(tag => exp.techStack.toLowerCase().includes(tag.toLowerCase())));
                 if(relevantExp.length > 0) {
                     hasTechMatch = true;
                     const yearsInStack = relevantExp.reduce((sum, e) => sum + e.years, 0);
                     techScore = Math.min(100, Math.round((yearsInStack / targetYears) * 100));
                 }
             }

             // Company Match Score
             let compScore = 0;
             let hasCompMatch = false;
             if (companyTags.length > 0) {
                 const relevantExp = empExp.filter(exp => companyTags.some(tag => exp.company.toLowerCase().includes(tag.toLowerCase())));
                 if(relevantExp.length > 0) {
                     hasCompMatch = true;
                     const yearsInComp = relevantExp.reduce((sum, e) => sum + e.years, 0);
                     compScore = Math.min(100, Math.round((yearsInComp / targetYears) * 100));
                 }
             }

           
             let finalScore = 0;
             let criteriaCount = 0;
             let isCandidate = true;

             if (techTags.length > 0) {
                 if (!hasTechMatch) isCandidate = false;
                 finalScore += techScore;
                 criteriaCount++;
             }

             if (companyTags.length > 0) {
                 if (!hasCompMatch) isCandidate = false;
                 finalScore += compScore;
                 criteriaCount++;
             }

             if (!isCandidate) return null;

             // Calculate Avg Score
             const matchScore = criteriaCount > 0 ? Math.round(finalScore / criteriaCount) : 0;

             // Summary String
             const totalRelevant = techScore > 0 ? (techScore * targetYears / 100) : 0;

             return {
                 ...emp,
                 matchScore,
                 totalRelevant 
             };

          }).filter(Boolean); 

          results.sort((a, b) => b.matchScore - a.matchScore);
          setCandidateResults(results);

      } catch (err) { console.error(err); showToast("Search failed", "error"); }
  };

  const clearFilters = () => {
      setTechTags([]);
      setCompanyTags([]);
      setMinYears("");
      setCandidateResults([]);
      setSearchPerformed(false);
      setResultLimit("all");
  };

  // --- VIEW EMPLOYEE DETAILS ---
  const openEmployeeDetails = async (employee, fromView) => {
      setSelectedEmployee(employee);
      setPreviousView(fromView); 
      setView("employee-details");
      try {
          const listRes = await experienceApi.get(`/api/experience/employee/${employee.id}`);
          setEmployeeExperience(listRes.data);
          const summaryRes = await experienceApi.get(`/api/experience/employee/summary/${employee.id}`);
          setExperienceSummary(summaryRes.data);
      } catch (err) { 
          setEmployeeExperience([]); 
          setExperienceSummary([]);
      }
  };

  // Handle Back Button logic
  const handleBackFromDetails = () => {
      setView(previousView); 
  };

  const displayedCandidates = resultLimit === "all" ? candidateResults : candidateResults.slice(0, parseInt(resultLimit));
  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#1E293B] via-[#111827] to-[#020617] font-sans text-slate-200 relative">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* POST CREATE MODALS */}
      {showPostCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400"><FiCheckCircle size={32} /></div>
                  <h2 className="text-xl font-bold text-white mb-2">Employee Added!</h2>
                  <p className="text-slate-400 mb-6">Would you like to add work experience details for <b>{newlyCreatedEmployee?.name}</b> now?</p>
                  <div className="flex gap-4 justify-center">
                      <button onClick={handleSkipExperience} className="px-6 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5">Skip</button>
                      <button onClick={handleStartAddExperience} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500">Yes, Add Details</button>
                  </div>
              </div>
          </div>
      )}
      {showAddExpFlow && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">Add Experience</h2><button onClick={handleSkipExperience} className="text-slate-400 hover:text-white text-sm">Finish & Close</button></div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-6 flex items-center gap-3"><FiInfo className="text-indigo-400" /><p className="text-xs text-indigo-200">Adding records for: <b>{newlyCreatedEmployee?.name}</b></p></div>
                  <form onSubmit={handleAddExperienceLoop} className="space-y-4">
                      <input placeholder="Company Name" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" required />
                      <div className="grid grid-cols-2 gap-4">
                          <input placeholder="Tech Stack (e.g. Java)" value={newExp.techStack} onChange={e => setNewExp({...newExp, techStack: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" required />
                          <input type="number" placeholder="Years (Int)" value={newExp.years} onChange={e => setNewExp({...newExp, years: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" required />
                      </div>
                      <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-2"><FiPlus /> Add & Add Another</button>
                  </form>
                  <div className="mt-6 text-center"><button onClick={handleSkipExperience} className="text-slate-500 hover:text-white text-sm underline">I'm done adding records</button></div>
              </div>
          </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0F172A] md:bg-white/5 backdrop-blur-lg border-r border-white/10 flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
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
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarBtn label="Employees" icon={<FiUsers />} active={view === 'list'} onClick={() => handleViewChange("list")} />
          <SidebarBtn label="Add Employee" icon={<FiUserPlus />} active={view === 'form' && !editingId} onClick={() => { handleAddClick(); setIsSidebarOpen(false); }} />
          <SidebarBtn label="Analytics" icon={<FiBarChart2 />} active={view === 'analytics'} onClick={() => handleViewChange("analytics")} />
          <SidebarBtn label="Talent Search" icon={<FiSearch />} active={view === 'candidate-search'} onClick={() => handleViewChange("candidate-search")} />
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <SidebarBtn label="Admin Profile" icon={<FiUser />} active={view === 'profile'} onClick={() => handleViewChange("profile")} />
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-red-500/5 text-red-400/80 hover:bg-red-600 hover:text-white"><FiLogOut className="text-xl" /><span className="font-medium">Logout</span></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 px-6 md:px-8 flex items-center justify-between bg-white/5 backdrop-blur-lg border-b border-white/10 z-10">
          <div className="flex items-center gap-4"><button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white p-2 rounded-lg bg-white/5 hover:bg-white/10"><FiMenu size={24} /></button><h2 className="text-xl md:text-2xl font-bold text-white tracking-wide"></h2></div>
          <div className="flex items-center gap-4"><div className="hidden md:block text-right text-sm"><p className="text-white font-medium">HR Administrator</p><p className="text-indigo-400 text-xs font-semibold">People Operations</p></div><div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border border-white/10 shadow-lg">HR</div></div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {/* VIEW: CANDIDATE SEARCH */}
          {view === "candidate-search" && (
              <div className="max-w-6xl mx-auto">
                  <h1 className="text-2xl font-bold text-white mb-6">Talent Search</h1>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                      <div className="grid md:grid-cols-3 gap-6">
                          
                          
                          <TagInput 
                             label="Tech Stack (Type & Enter)"
                             placeholder="e.g. Java"
                             tags={techTags}
                             setTags={setTechTags}
                          />

                         
                          <TagInput 
                             label="Company Name (Type & Enter)"
                             placeholder="e.g. Google"
                             tags={companyTags}
                             setTags={setCompanyTags}
                          />

                          <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wide">Minimum Years</label>
                            <input type="number" placeholder="e.g. 5" value={minYears} onChange={e => setMinYears(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500 h-[48px]" />
                          </div>

                      </div>
                      
                      <div className="flex gap-3 justify-end mt-6">
                          <button onClick={clearFilters} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 transition-colors">
                             <FiRefreshCw /> Clear
                          </button>
                          <button onClick={handleCandidateSearch} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium px-8 py-2.5 transition-colors shadow-lg shadow-indigo-500/20">
                             Search Candidates
                          </button>
                      </div>
                  </div>
                  
                  {searchPerformed && (
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Results ({candidateResults.length})</h3>
                              
<select 
  value={resultLimit} 
  onChange={(e) => setResultLimit(e.target.value)}
  className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-white outline-none focus:border-indigo-500"
>
    {/* ADD CLASS HERE */}
    <option value="5" className="bg-[#0F172A] text-white">Show 5</option>
    <option value="10" className="bg-[#0F172A] text-white">Show 10</option>
    <option value="all" className="bg-[#0F172A] text-white">Show All</option>
</select>
                          </div>
                          
                          {displayedCandidates.length === 0 ? ( <div className="text-center text-slate-500 py-10">No candidates found.</div> ) : (
                              displayedCandidates.map(res => (
                                  <div key={res.id} onClick={() => openEmployeeDetails(res, "candidate-search")} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
                                      <div className="flex items-center gap-4">
                                          <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white font-bold border-4 ${res.matchScore >= 90 ? 'bg-emerald-500/20 border-emerald-500' : (res.matchScore >= 50 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-red-500/20 border-red-500')}`}>
                                              <span className="text-sm">{res.matchScore}%</span>
                                          </div>
                                          <div>
                                              <h4 className="text-lg font-semibold text-white">{res.name}</h4>
                                              <p className="text-slate-400 text-sm">{res.designation}</p>
                                              <p className="text-indigo-400 text-xs mt-0.5">{Math.round(res.totalRelevant)} Years Relevant</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <FiArrowLeft className="rotate-180 text-slate-500" />
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}
              </div>
          )}

          
          {view === "list" && (
             <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col min-h-[600px]">
                <div className="mb-6 relative"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0F172A]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all" /></div>
                <div className="overflow-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-[#1E293B] z-10 shadow-sm"><tr><th className="p-4 text-xs font-semibold text-slate-400 uppercase rounded-tl-lg">Name</th><th className="p-4 text-xs font-semibold text-slate-400 uppercase">Email</th><th className="p-4 text-xs font-semibold text-slate-400 uppercase">Designation</th><th className="p-4 text-xs font-semibold text-slate-400 uppercase">Salary</th><th className="p-4 text-xs font-semibold text-slate-400 uppercase text-right rounded-tr-lg">Actions</th></tr></thead>
                    <tbody className="divide-y divide-white/5 text-sm">{filteredEmployees.map((emp) => (<tr key={emp.id} onClick={() => openEmployeeDetails(emp, "list")} className="hover:bg-white/5 transition-colors group cursor-pointer"><td className="p-4 text-slate-200 font-medium">{emp.name}</td><td className="p-4 text-slate-400">{emp.email}</td><td className="p-4 text-slate-300">{emp.designation}</td><td className="p-4 text-emerald-400">₹{Number(emp.salary).toLocaleString()}</td><td className="p-4 text-right" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-end gap-3"><button onClick={(e) => handleEditClick(e, emp)} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg border border-indigo-500/20"><FiEdit2 /></button><button onClick={() => handleDelete(emp.id)} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/20"><FiTrash2 /></button></div></td></tr>))}</tbody>
                  </table>
                </div>
             </div>
          )}

          
          {view === "employee-details" && selectedEmployee && (
             <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-2">
                   
                    <button onClick={handleBackFromDetails} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"><FiArrowLeft size={20} /></button>
                    <h1 className="text-2xl font-bold text-white">Employee Profile</h1>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden h-fit">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                            <div className="flex flex-col items-center gap-4"><div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-[#1E293B]">{selectedEmployee.name.charAt(0)}</div><div className="text-center"><h2 className="text-xl font-bold text-white">{selectedEmployee.name}</h2><p className="text-indigo-300 text-sm">{selectedEmployee.designation}</p></div></div>
                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0F172A]/40 p-6 rounded-xl border border-white/5"><ProfileField label="Email" value={selectedEmployee.email} /><ProfileField label="Employee ID" value={`#${selectedEmployee.id}`} /><ProfileField label="DOB" value={selectedEmployee.birthDate} /><ProfileField label="Salary" value={`₹${Number(selectedEmployee.salary).toLocaleString()}`} /></div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-[300px] flex flex-col items-center justify-center">
                        <h3 className="text-white font-semibold mb-2">Skill Distribution</h3>
                        {experienceSummary.length > 0 ? (
                           <div className="w-full h-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={experienceSummary} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="totalYears" nameKey="techStack">{experienceSummary.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Legend verticalAlign="bottom" height={36} /><RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', color: '#000' }} /></PieChart></ResponsiveContainer></div>
                        ) : (<div className="text-slate-500 text-sm">No experience data</div>)}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FiBriefcase /> Work History</h2>
                    <div className="space-y-4">
                        {employeeExperience.length === 0 ? (<div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center text-slate-500">No experience records found.</div>) : (employeeExperience.map(exp => (<div key={exp.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center"><div><h3 className="text-white font-semibold">{exp.company}</h3><div className="flex gap-3 mt-1 text-sm text-slate-400"><span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{exp.techStack}</span><span>{exp.years} Years</span></div></div></div>)))}
                    </div>
                </div>
             </div>
          )}

          
          {view === "form" && (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-6"><button onClick={() => setView("list")} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><FiArrowLeft size={20} /></button><h1 className="text-2xl font-bold text-white">{editingId ? "Edit Employee" : "Add New Employee"}</h1></div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl ${editingId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6"><InputField label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} icon={<FiUser />} placeholder="e.g. John Doe" /><InputField label="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} icon={<FiMail />} placeholder="e.g. john@company.com" type="email" /><InputField label="Designation" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} icon={<FiBriefcase />} placeholder="e.g. Developer" /><InputField label="Salary (₹)" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} icon={<FiDollarSign />} placeholder="e.g. 85000" type="number" /><InputField label="Date of Birth" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} icon={<FiCalendar />} type="date" /></div>
                      <div><label className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 block flex items-center gap-2"><FiShield /> System Role</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-[#0F172A]/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"><option value="USER">User (Employee Access)</option><option value="ADMIN">Admin (Full Access)</option></select></div>
                      <div className="pt-6 border-t border-white/5 flex gap-4 justify-end items-center">
                        {editingId && (<button type="button" onClick={handleResetCredentials} className="px-6 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2 mr-auto"><FiLock /> <span className="hidden sm:inline">Reset Password</span></button>)}
                        <button type="button" onClick={() => setView("list")} className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"><FiX /> Cancel</button>
                        <button type="submit" disabled={formSaving} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2">{formSaving ? "Saving..." : <><FiSave /> {editingId ? "Update" : "Create"}</>}</button>
                      </div>
                    </form>
                  </div>

                  
                  {editingId && (
                      <div className="bg-[#0F172A]/50 border border-white/10 rounded-2xl p-6 h-fit">
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FiBriefcase /> Experience</h3>
                          <form onSubmit={handleAddExperienceInsideEdit} className="space-y-3 mb-6">
                              <input placeholder="Company" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none" required />
                              <input placeholder="Stack (e.g. Java)" value={newExp.techStack} onChange={e => setNewExp({...newExp, techStack: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none" required />
                              <input type="number" placeholder="Years (Int)" value={newExp.years} onChange={e => setNewExp({...newExp, years: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none" required />
                              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-500">Add Record</button>
                          </form>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                              {employeeExperience.map(exp => (
                                  <div key={exp.id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex justify-between items-start group">
                                      <div><p className="text-white font-medium text-sm">{exp.company}</p><p className="text-xs text-slate-400">{exp.techStack} • {exp.years} yrs</p></div>
                                      <button onClick={() => handleDeleteExperience(exp.id)} className="text-slate-500 hover:text-red-400"><FiX /></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
            </div>
          )}

          
          {view === "analytics" && (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6"><h1 className="text-3xl font-semibold text-white">Workforce Analytics</h1></div>
                <div className="grid md:grid-cols-4 gap-6"><StatBox icon={<FiUsers size={24} />} title="Total Employees" value={employees.length} sub="Active" color="from-indigo-600 to-purple-600" /><StatBox icon={<span className="text-2xl font-bold">₹</span>} title="Average Salary" value={`₹${Number(analyticsData.avgSalary).toLocaleString()}`} sub="Per Month" color="from-emerald-600 to-teal-600" /><StatBox icon={<FiTrendingUp size={24} />} title="Highest Salary" value={`₹${Math.max(...employees.map(e => Number(e.salary) || 0), 0).toLocaleString()}`} sub="Max CTC" color="from-pink-600 to-rose-600" /><StatBox icon={<FiAward size={24} />} title="Unique Roles" value={new Set(employees.map(e => e.designation)).size} sub="Departments" color="from-blue-600 to-cyan-600" /></div>
                <div className="grid lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-[400px]"><h3 className="text-lg font-semibold text-white mb-6">Employees by Designation</h3><div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsData.designation} margin={{ bottom: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /><XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} angle={-15} textAnchor="end" /><YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} /><RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} /><Bar dataKey="count" fill="#818CF8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-[400px]"><h3 className="text-lg font-semibold text-white mb-6">Salary Distribution</h3><div className="h-[300px] w-full flex items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analyticsData.salary} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{analyticsData.salary.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', color: '#000' }} /></PieChart></ResponsiveContainer></div><div className="flex justify-center gap-4 -mt-4 flex-wrap">{analyticsData.salary.map((entry, index) => (<div key={index} className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>{entry.name}</div>))}</div></div>
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-[350px]"><h3 className="text-lg font-semibold text-white mb-6">Employees by Age Group</h3><div className="h-[250px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analyticsData.age}><defs><linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/><stop offset="95%" stopColor="#34D399" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /><RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} /><Area type="monotone" dataKey="count" stroke="#34D399" fillOpacity={1} fill="url(#colorAge)" /></AreaChart></ResponsiveContainer></div></div>
                </div>
            </div>
          )}

          
          {view === "profile" && ( <div className="max-w-4xl mx-auto space-y-6"><div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"><div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div><div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div><div className="flex flex-col md:flex-row gap-8 items-start relative z-10"><div className="flex flex-col items-center gap-4"><div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-[#1E293B]">A</div><div className="text-center"><h2 className="text-xl font-bold text-white">{adminProfile.name}</h2><p className="text-indigo-300 text-sm">{adminProfile.designation}</p></div></div><div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0F172A]/40 p-6 rounded-xl border border-white/5"><ProfileField label="Admin ID" value={adminProfile.id} /><ProfileField label="Role" value={adminProfile.role} /><ProfileField label="Email Address" value={adminProfile.email} /><ProfileField label="Access Level" value={adminProfile.accessLevel} /><div className="md:col-span-2 mt-2 pt-4 border-t border-white/5"><label className="text-emerald-400/80 text-xs uppercase tracking-wider font-semibold block mb-1">System Status</label><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div><span className="text-lg font-bold text-emerald-400">Operational</span></div></div></div></div></div><div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-indigo-400"><FiInfo size={20} /></div><div><h3 className="text-white font-medium">Need System Support?</h3><p className="text-slate-400 text-sm">Contact the IT department for critical issues.</p></div></div><div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 w-full md:w-auto justify-center"><FiMail /><span className="text-sm font-mono">it-support@ems.com</span></div></div></div> )}
        </div>
      </main>
    </div>
  );
}


function TagInput({ label, placeholder, tags, setTags }) {
    const [input, setInput] = useState("");
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = input.trim();
            if (val) {
                setTags([...tags, val]);
                setInput("");
            }
        }
    };
    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };
    return (
        <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wide">{label}</label>
            <div className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 flex flex-wrap gap-2 min-h-[48px] focus-within:border-indigo-500 transition-colors">
                {tags.map((tag, index) => (
                    <span key={index} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                        {tag} <button onClick={() => removeTag(index)} className="hover:text-red-600"><FiX /></button>
                    </span>
                ))}
                <input placeholder={tags.length === 0 ? placeholder : ""} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="bg-transparent text-white outline-none text-sm flex-1 min-w-[80px]" />
            </div>
        </div>
    );
}

// Helper Components
function InputField({ label, value, onChange, icon, placeholder, type = "text" }) {
  const isDate = type === "date"; const inputType = isDate ? (value ? "date" : "text") : type;
  return (
    <div><label className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2 block flex items-center gap-2">{icon} {label}</label><input type={inputType} value={value} onChange={onChange} placeholder={isDate ? "DD-MM-YYYY" : placeholder} required onFocus={(e)=>{if(isDate){e.target.type="date";if(e.target.showPicker)e.target.showPicker()}}} onBlur={(e)=>{if(isDate&&!e.target.value)e.target.type="text"}} style={{colorScheme:"dark"}} className="w-full bg-[#0F172A]/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500" /></div>
  );
}
function StatBox({ icon, title, value, sub, color }) { return (<div className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-2xl relative overflow-hidden`}><div className="absolute top-0 right-0 p-4 opacity-20 text-white">{icon}</div><h3 className="text-white/80 font-medium text-sm">{title}</h3><div className="mt-2"><span className="text-2xl font-bold text-white block">{value}</span><span className="text-white/60 text-xs">{sub}</span></div></div>); }
function ProfileField({ label, value }) { return (<div><label className="text-slate-500 text-xs uppercase tracking-wider font-semibold block mb-1">{label}</label><p className="text-slate-200 font-medium text-base break-words">{value}</p></div>); }
function SidebarBtn({ label, icon, active, onClick }) { return (<button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? "bg-white/10 text-white shadow-lg border border-white/5" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><span className="text-xl">{icon}</span><span className="font-medium">{label}</span></button>); }
