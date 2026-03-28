import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Plus, ArrowUpDown, Box, X } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  lastOrdered: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const SparePartsInventory: React.FC = () => {
  const [parts] = useState<SparePart[]>([
    {
      id: '1',
      partNumber: 'SP-001',
      name: 'Hydraulic Seal Kit',
      category: 'Hydraulics',
      quantity: 25,
      minStock: 10,
      maxStock: 50,
      unitPrice: 150.00,
      supplier: 'Industrial Parts Co.',
      lastOrdered: '2024-03-10',
      status: 'in-stock'
    },
    {
      id: '2',
      partNumber: 'SP-002',
      name: 'Bearing Assembly 6205',
      category: 'Bearings',
      quantity: 8,
      minStock: 15,
      maxStock: 60,
      unitPrice: 45.00,
      supplier: 'Bearing World',
      lastOrdered: '2024-02-28',
      status: 'low-stock'
    },
    {
      id: '3',
      partNumber: 'SP-003',
      name: 'Servo Motor 750W',
      category: 'Electronics',
      quantity: 3,
      minStock: 5,
      maxStock: 20,
      unitPrice: 890.00,
      supplier: 'TechParts Inc.',
      lastOrdered: '2024-03-05',
      status: 'low-stock'
    },
    {
      id: '4',
      partNumber: 'SP-004',
      name: 'Conveyor Belt 2m',
      category: 'Conveyor',
      quantity: 0,
      minStock: 5,
      maxStock: 15,
      unitPrice: 320.00,
      supplier: 'Belt Masters',
      lastOrdered: '2024-02-15',
      status: 'out-of-stock'
    },
    {
      id: '5',
      partNumber: 'SP-005',
      name: 'Pneumatic Valve',
      category: 'Pneumatics',
      quantity: 42,
      minStock: 20,
      maxStock: 80,
      unitPrice: 75.00,
      supplier: 'PneuTech',
      lastOrdered: '2024-03-12',
      status: 'in-stock'
    },
  ]);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in-stock':
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'In Stock', icon: TrendingUp };
      case 'low-stock':
        return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Low Stock', icon: AlertTriangle };
      case 'out-of-stock':
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Out of Stock', icon: TrendingDown };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Unknown', icon: Package };
    }
  };

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: parts.length,
    inStock: parts.filter(p => p.status === 'in-stock').length,
    lowStock: parts.filter(p => p.status === 'low-stock').length,
    outOfStock: parts.filter(p => p.status === 'out-of-stock').length,
    totalValue: parts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0)
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Spare Parts Inventory</h2>
              <p className="text-sm text-gray-500">{stats.total} total parts • ${stats.totalValue.toLocaleString()} value</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Part
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Parts', value: stats.total, color: 'blue', icon: Package },
            { label: 'In Stock', value: stats.inStock, color: 'green', icon: TrendingUp },
            { label: 'Low Stock', value: stats.lowStock, color: 'amber', icon: AlertTriangle },
            { label: 'Out of Stock', value: stats.outOfStock, color: 'red', icon: X }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className={`p-4 rounded-xl border border-gray-100 hover:border-${stat.color}-200 hover:shadow-md transition-all duration-300 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 bg-${stat.color}-100 rounded-xl`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search parts by name, number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  Part Number
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                  Name
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredParts.map((part, index) => {
              const statusConfig = getStatusConfig(part.status);
              const stockPercentage = (part.quantity / part.maxStock) * 100;
              
              return (
                <tr 
                  key={part.id}
                  className="hover:bg-gray-50/50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-gray-900">{part.partNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Box className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{part.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {part.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{part.quantity}</span>
                    <span className="text-gray-400 text-sm"> / {part.maxStock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{stockPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            part.status === 'in-stock' ? 'bg-green-500' : 
                            part.status === 'low-stock' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">${part.unitPrice.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      <statusConfig.icon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SparePartsInventory;
