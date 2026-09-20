import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AIActivityFeed from "../common/AIActivityFeed";
import { useApp } from "../../context/AppContext";
import { X } from "lucide-react";

export default function Layout({ children }) {
  const { showActivityModal, setShowActivityModal } = useApp();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* AI Activity Drawer */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">AI Activity Feed</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AIActivityFeed compact={false} />
          </div>
        </div>
      )}
    </div>
  );
}