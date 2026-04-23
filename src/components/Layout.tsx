import React from 'react';
import Navbar from './Navbar';
import AIAssistant from './AIAssistant';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E4E4E7] font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 relative">
        {children}
      </main>
      <AIAssistant />
      <footer className="py-10 border-t border-border bg-header">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand">SmartStay</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Unified urban living platform connecting you with homes, food, and essential services for a smarter lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <ul className="text-sm space-y-2 text-zinc-400 cursor-pointer">
              <li className="hover:text-brand transition-all">Accommodation</li>
              <li className="hover:text-brand transition-all">Food Plans</li>
              <li className="hover:text-brand transition-all">Appliance Rental</li>
              <li className="hover:text-brand transition-all">Home Services</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
