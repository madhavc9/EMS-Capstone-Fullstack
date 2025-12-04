// src/components/Footer.js
import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Toast from "./Toast"; 

export default function Footer() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const handleSubscribe = () => {
    if (!email || !email.includes("@")) {
      setToast({ show: true, message: "Please enter a valid email address.", type: "error" });
      setTimeout(() => setToast({ show: false, message: "", type: "error" }), 3000);
      return;
    }

    // Simulate subscription logic
    setToast({ show: true, message: "Thanks for subscribing!", type: "success" });
    setEmail(""); 
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  return (
    <footer className="mt-12 bg-white/5 backdrop-blur-xl border-t border-white/10 py-16 px-6 relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 tracking-wide">
            EMS <span className="text-indigo-400">Portal</span>
          </h2>
          <div className="space-y-3 text-slate-400">
            <p>📧 support@emsportal.com</p>
            <p>📍 India</p>
            <p>📞 +91 98765 43210</p>
          </div>

          <div className="flex gap-6 text-white text-xl mt-8">
            <FaFacebookF className="cursor-pointer hover:text-indigo-400 transition hover:scale-110" />
            <FaInstagram className="cursor-pointer hover:text-pink-500 transition hover:scale-110" />
            <FaLinkedinIn className="cursor-pointer hover:text-blue-500 transition hover:scale-110" />
          </div>
        </div>

        
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Subscribe for Updates
          </h2>
          <p className="text-slate-400 text-base mb-6">
            Join our newsletter to stay informed about the latest EMS features and announcements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg transition-all"
            />
            <button 
              onClick={handleSubscribe}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/25 hover:opacity-95 transition-all whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
      
      
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
        © 2025 EMS Portal. All rights reserved.
      </div>
    </footer>
  );
}