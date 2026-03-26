// src/pages/Dashboard.tsx
import React from 'react';
import ProductionOverview from '../components/dashboard/ProductionOverview';
import InventoryStatus from '../components/dashboard/InventoryStatus';
import QualityMetrics from '../components/dashboard/QualityMetrics';
import MaintenanceSchedule from '../components/dashboard/MaintenanceSchedule';
import KPIDisplay from '../components/dashboard/KPIDisplay';
import { Activity, Plus, FileText, TrendingUp, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const quickActions = [
    { label: 'New Work Order', icon: Plus, color: 'bg-blue-500' },
    { label: 'View Reports', icon: FileText, color: 'bg-green-500' },
    { label: 'Analytics', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Schedule', icon: Calendar, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">Manufacturing Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time overview of your production floor</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 
                         hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className={`p-1.5 rounded-md ${action.color} text-white group-hover:scale-110 transition-transform`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Display Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <KPIDisplay />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <ProductionOverview />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <InventoryStatus />
          </div>
        </div>
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <QualityMetrics />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            <MaintenanceSchedule />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
