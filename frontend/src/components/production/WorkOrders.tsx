// components/production/WorkOrders.tsx
import React, { useState } from 'react';
import { Clipboard, Clock, Users, AlertTriangle, Check, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface WorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  startDate: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string[];
  progress: number;
}

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockWorkOrders: WorkOrder[] = [
        {
          id: '1',
          orderNumber: 'WO-2024-001',
          productName: 'Industrial Gear Assembly',
          quantity: 500,
          startDate: '2024-01-20',
          dueDate: '2024-01-28',
          status: 'in-progress',
          priority: 'high',
          assignedTo: ['John Doe', 'Jane Smith'],
          progress: 65
        },
        {
          id: '2',
          orderNumber: 'WO-2024-002',
          productName: 'Steel Brackets',
          quantity: 1200,
          startDate: '2024-01-22',
          dueDate: '2024-01-30',
          status: 'pending',
          priority: 'medium',
          assignedTo: ['Mike Johnson'],
          progress: 0
        },
        {
          id: '3',
          orderNumber: 'WO-2024-003',
          productName: 'Hydraulic Pumps',
          quantity: 250,
          startDate: '2024-01-18',
          dueDate: '2024-01-25',
          status: 'completed',
          priority: 'high',
          assignedTo: ['Sarah Wilson', 'Tom Brown'],
          progress: 100
        },
        {
          id: '4',
          orderNumber: 'WO-2024-004',
          productName: 'Control Valves',
          quantity: 800,
          startDate: '2024-01-15',
          dueDate: '2024-01-22',
          status: 'delayed',
          priority: 'low',
          assignedTo: ['Emily Davis'],
          progress: 45
        },
      ];
      setWorkOrders(mockWorkOrders);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'in-progress':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'delayed':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const filteredOrders = workOrders
    .filter(order => 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(order => statusFilter === 'all' || order.status === statusFilter);

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
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Clipboard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Work Orders</h2>
              <p className="text-sm text-gray-500">{filteredOrders.length} orders</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Create Work Order
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredOrders.map((order, index) => {
          const colors = getStatusColor(order.status);
          
          return (
            <div 
              key={order.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getPriorityIcon(order.priority)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.productName}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {new Date(order.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {order.assignedTo.length} assigned
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{order.quantity}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-700">{order.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      order.status === 'completed' ? 'bg-green-500' :
                      order.status === 'delayed' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          View All Work Orders <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WorkOrders;
