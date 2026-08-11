import React from "react";

export default function ClienteLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative pb-24">
        {children}
      </div>
    </div>
  );
}
