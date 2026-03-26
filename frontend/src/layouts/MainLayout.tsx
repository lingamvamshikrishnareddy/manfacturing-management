import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/shared/Header';
import Sidebar from '../components/shared/Sidebar';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileOpen = () => {
    setIsMobileOpen(true);
  };

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        onMenuClick={handleMobileOpen} 
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        isMobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Main Content */}
      <main 
        className={`
          flex-1 pt-16 transition-all duration-300
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
