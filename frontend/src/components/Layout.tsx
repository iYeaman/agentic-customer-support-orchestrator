import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket as TicketIcon, Bot, Users, Settings, LogOut, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tickets', path: '/tickets', icon: TicketIcon },
    { name: 'AI Operations', path: '/ai-ops', icon: Bot },
    { name: 'Audit Logs', path: '/audit', icon: Activity },
    { name: 'Customer Portal', path: '/portal', icon: Users },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Agentic<span className="text-primary-600">Ops</span></span>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-700" : "text-gray-400")} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors">
          <LogOut className="w-5 h-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Demo Mode</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-700">A</span>
        </div>
      </div>
    </header>
  );
};

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
