import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [employeeId, setEmployeeId] = useState(localStorage.getItem("employeeId") || "");

  const loginWithToken = (backendResponse) => {
    const { token, role, employeeId } = backendResponse;
    const prefixedRole = `ROLE_${role}`; 
    
    setToken(token);
    setRole(prefixedRole);
    setEmployeeId(employeeId); 

    localStorage.setItem("token", token);
    localStorage.setItem("role", prefixedRole);
    localStorage.setItem("employeeId", employeeId?.toString() || "");
  };

  const logout = () => {
    setToken("");
    setRole("");
    setEmployeeId(""); 
    
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employeeId");
    window.location.href = "/";
  };

  const isAuthenticated = () => token !== "";

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedId = localStorage.getItem("employeeId"); 
    
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      if (storedId) setEmployeeId(storedId);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, employeeId, loginWithToken, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);