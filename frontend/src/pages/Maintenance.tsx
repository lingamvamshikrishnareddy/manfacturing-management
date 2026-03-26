// src/pages/Maintenance.tsx
import React from 'react';
import MaintenanceRequests from '../components/maintenance/MaintenanceRequests';
import PreventiveMaintenance from '../components/maintenance/PreventiveMaintenance';
import EquipmentHistory from '../components/maintenance/EquipmentHistory';
import SparePartsInventory from '../components/maintenance/SparePartsInventory';
import { Plus, Wrench, BarChart3, Calendar, AlertTriangle } from 'lucide-react';

const Maintenance: React.FC = () => {
  const quickActions = [
    { label: 'New Request', icon: Plus, color: 'bg-blue-500' },
    { label: 'Schedule', icon: Calendar, color: 'bg-green-500' },
    { label: 'Equipment', icon: Wrench, color: 'bg-purple-500' },
    { label: 'Reports', icon: BarChart3, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="text-gray-500 mt-1">Track equipment maintenance, requests, and schedules</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 
                         hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
            >
              <div className={`p-1.5 rounded-md ${action.color} text-white group-hover:scale-110 transition-transform`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <MaintenanceRequests />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <PreventiveMaintenance />
          </div>
        </div>
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <EquipmentHistory />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <SparePartsInventory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
