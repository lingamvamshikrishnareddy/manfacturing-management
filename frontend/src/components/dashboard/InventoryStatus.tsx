// components/dashboard/InventoryStatus.tsx
import React from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingDown, ArrowRight, Bell } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  status: 'low' | 'optimal' | 'excess';
}

const InventoryStatus: React.FC = () => {
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockData: InventoryItem[] = [
        { id: '1', name: 'Steel Sheets', currentStock: 45, minimumStock: 100, status: 'low' },
        { id: '2', name: 'Aluminum Rods', currentStock: 180, minimumStock: 150, status: 'optimal' },
        { id: '3', name: 'Copper Wire', currentStock: 320, minimumStock: 200, status: 'excess' },
        { id: '4', name: 'Plastic Pellets', currentStock: 80, minimumStock: 100, status: 'low' },
        { id: '5', name: 'Rubber Gaskets', currentStock: 250, minimumStock: 180, status: 'optimal' },
      ];
      setInventoryItems(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const getLowStockItems = () => inventoryItems.filter(item => item.status === 'low');

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'low':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' };
      case 'optimal':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', badge: 'bg-green-100 text-green-700' };
      case 'excess':
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-500', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card">
        <CardSkeleton />
      </div>
    );
  }

  const lowStockItems = getLowStockItems();

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inventory Status</h2>
              <p className="text-sm text-gray-500">{inventoryItems.length} items tracked</p>
            </div>
          </div>
          {lowStockItems.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
              <Bell className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-700">{lowStockItems.length} Low Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-b border-red-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-800">Low Stock Alert</p>
              <p className="text-sm text-red-600">{lowStockItems.length} items below minimum level</p>
            </div>
            <button className="text-sm text-red-700 hover:text-red-900 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inventory Items */}
      <div className="divide-y divide-gray-100">
        {inventoryItems.map((item, index) => {
          const styles = getStatusStyles(item.status);
          const stockPercentage = Math.min((item.currentStock / item.minimumStock) * 100, 100);
          
          return (
            <div 
              key={item.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${styles.bg}`}>
                    {item.status === 'optimal' ? (
                      <CheckCircle className={`h-5 w-5 ${styles.icon}`} />
                    ) : item.status === 'low' ? (
                      <TrendingDown className={`h-5 w-5 ${styles.icon}`} />
                    ) : (
                      <Package className={`h-5 w-5 ${styles.icon}`} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{item.currentStock} units</span>
                      <span>•</span>
                      <span>Min: {item.minimumStock}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Stock Bar */}
                  <div className="hidden sm:block w-24">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === 'low' ? 'bg-red-500' :
                          item.status === 'excess' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                    {item.status === 'low' ? 'Low Stock' : 
                     item.status === 'excess' ? 'Excess' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryStatus;
