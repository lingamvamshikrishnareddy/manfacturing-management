// components/inventory/StockLevels.tsx
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { StockItem } from '../../types';
import { CardSkeleton } from '../ui/Skeleton';

interface StockLevelItem extends StockItem {
  status: 'low' | 'normal' | 'full';
}

const StockLevels: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockLevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockData: StockLevelItem[] = [
        {
          id: '1',
          name: 'Steel Sheets',
          category: 'Raw Material',
          currentStock: 150,
          minStock: 50,
          maxStock: 500,
          unit: 'sheets',
          location: 'Warehouse A',
          supplier: 'Steel Corp',
          lastUpdated: '2024-01-15',
          cost: 25.50,
          status: 'normal'
        },
        {
          id: '2',
          name: 'Aluminum Rods',
          category: 'Raw Material',
          currentStock: 45,
          minStock: 80,
          maxStock: 300,
          unit: 'pieces',
          location: 'Warehouse B',
          supplier: 'AlumTech',
          lastUpdated: '2024-01-14',
          cost: 15.75,
          status: 'low'
        },
        {
          id: '3',
          name: 'Copper Wire',
          category: 'Component',
          currentStock: 280,
          minStock: 100,
          maxStock: 400,
          unit: 'meters',
          location: 'Warehouse A',
          supplier: 'CopperWorld',
          lastUpdated: '2024-01-13',
          cost: 8.50,
          status: 'full'
        },
        {
          id: '4',
          name: 'Plastic Pellets',
          category: 'Raw Material',
          currentStock: 320,
          minStock: 150,
          maxStock: 600,
          unit: 'kg',
          location: 'Warehouse C',
          supplier: 'Polymer Inc',
          lastUpdated: '2024-01-12',
          cost: 2.25,
          status: 'normal'
        },
      ];
      setStockItems(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'low':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' };
      case 'full':
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' };
      default:
        return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', badge: 'bg-green-100 text-green-700' };
    }
  };

  const filteredItems = stockItems
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => filterStatus === 'all' || item.status === filterStatus);

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
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Stock Levels</h2>
              <p className="text-sm text-gray-500">{filteredItems.length} items</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal</option>
              <option value="full">Full Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Items List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredItems.map((item, index) => {
          const styles = getStatusStyles(item.status);
          const percentage = Math.min((item.currentStock / item.maxStock) * 100, 100);
          
          return (
            <div 
              key={item.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-xl ${styles.bg}`}>
                    {item.status === 'low' ? (
                      <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
                    ) : item.status === 'full' ? (
                      <TrendingUp className={`h-5 w-5 ${styles.icon}`} />
                    ) : (
                      <CheckCircle className={`h-5 w-5 ${styles.icon}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                        {item.status === 'low' ? 'Low Stock' : item.status === 'full' ? 'Full' : 'Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.category}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{item.location}</span>
                      <span>•</span>
                      <span>{item.supplier}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{item.currentStock}</p>
                  <p className="text-xs text-gray-500">{item.unit}</p>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Stock Level</span>
                  <span className="font-medium text-gray-700">{percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'low' ? 'bg-red-500' :
                      item.status === 'full' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockLevels;
