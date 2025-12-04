// src/components/FrostedCard.js
import React from "react";

export default function FrostedCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/10 backdrop-blur-xl border border-white/20 
                  shadow-xl rounded-2xl p-6 transition cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
