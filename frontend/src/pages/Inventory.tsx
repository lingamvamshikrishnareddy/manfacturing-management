// src/pages/Inventory.tsx
import React from 'react';
import StockLevels from '../components/inventory/StockLevels';
import MaterialRequests from '../components/inventory/MaterialRequests';
import SupplierManagement from '../components/inventory/SupplierManagement';
import InventoryReports from '../components/inventory/InventoryReports';
import { Plus, Package, Truck, BarChart3 } from 'lucide-react';

const Inventory: React.FC = () => {
  const quickActions = [
    { label: 'Add Stock', icon: Plus, color: 'bg-blue-500' },
    { label: 'New Request', icon: Package, color: 'bg-green-500' },
    { label: 'Suppliers', icon: Truck, color: 'bg-purple-500' },
    { label: 'Reports', icon: BarChart3, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Track stock levels, manage suppliers, and handle material requests</p>
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
            <StockLevels />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <MaterialRequests />
          </div>
        </div>
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <SupplierManagement />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <InventoryReports />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
