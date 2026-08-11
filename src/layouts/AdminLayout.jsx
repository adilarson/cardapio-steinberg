import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AdminLayout({ children, tipo = "restaurante" }) {
  return (
    <div className="min-h-screen bg-stone-100 flex">
      <Sidebar tipo={tipo} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
