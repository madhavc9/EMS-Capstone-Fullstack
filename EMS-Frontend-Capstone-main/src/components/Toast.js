// src/components/Toast.js
import React, { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1.7; 
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div
        className={`min-w-[260px] p-4 rounded-xl shadow-lg backdrop-blur-xl border 
        ${type === "success" ? "bg-green-600/80 border-green-400/40" : "bg-red-600/80 border-red-400/40"}`}
      >
        <p className="text-white text-sm font-medium">{message}</p>

        {/* Progress Bar */}
        <div className="w-full mt-3 h-[4px] bg-white/20 rounded overflow-hidden">
          <div
            className="h-full bg-white/90 transition-all duration-75"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
