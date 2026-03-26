// components/dashboard/MaintenanceSchedule.tsx
import React from 'react';
import { Calendar, Clock, Wrench, AlertTriangle, ArrowRight, CheckCircle, User } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface MaintenanceTask {
  id: string;
  equipment: string;
  type: 'preventive' | 'corrective';
  scheduledDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
}

const MaintenanceSchedule: React.FC = () => {
  const [tasks, setTasks] = React.useState<MaintenanceTask[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockTasks: MaintenanceTask[] = [
        {
          id: '1',
          equipment: 'CNC Machine #1',
          type: 'preventive',
          scheduledDate: new Date().toISOString().split('T')[0],
          priority: 'high',
          status: 'in-progress',
          assignedTo: 'John Smith'
        },
        {
          id: '2',
          equipment: 'Assembly Line B',
          type: 'corrective',
          scheduledDate: new Date().toISOString().split('T')[0],
          priority: 'medium',
          status: 'pending',
          assignedTo: 'Sarah Johnson'
        },
        {
          id: '3',
          equipment: 'Packaging Unit',
          type: 'preventive',
          scheduledDate: new Date().toISOString().split('T')[0],
          priority: 'low',
          status: 'pending',
          assignedTo: 'Mike Davis'
        },
        {
          id: '4',
          equipment: 'Hydraulic Press',
          type: 'preventive',
          scheduledDate: new Date().toISOString().split('T')[0],
          priority: 'high',
          status: 'completed',
          assignedTo: 'Emily Brown'
        },
      ];
      setTasks(mockTasks);
      setLoading(false);
    }, 800);
  }, [selectedDate]);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' };
      case 'in-progress':
        return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card">
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
            <div className="p-2.5 bg-orange-100 rounded-xl">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Maintenance Schedule</h2>
              <p className="text-sm text-gray-500">{tasks.length} scheduled tasks</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-700">{inProgressTasks} In Progress</span>
            </div>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">{pendingTasks} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {tasks.map((task, index) => {
          const priorityStyles = getPriorityStyles(task.priority);
          const statusStyles = getStatusStyles(task.status);
          
          return (
            <div 
              key={task.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Priority Indicator */}
                  <div className={`mt-1 w-2 h-2 rounded-full ${priorityStyles.dot}`} />
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{task.equipment}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles.badge}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${priorityStyles.bg} ${priorityStyles.text}`}>
                        {task.priority}
                      </span>
                      <span className="capitalize">{task.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    <span>{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          View Full Schedule <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MaintenanceSchedule;
