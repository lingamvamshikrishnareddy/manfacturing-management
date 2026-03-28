import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Users,
  Plus,
  Edit2,
  Trash2,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sunset,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Shift, ShiftSchedule, ShiftStats } from '../../types/employee';
import { employeeAPI } from '../../services/api/employeeAPI';

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddShift, setShowAddShift] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [, setSelectedShift] = useState<Shift | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [shiftsRes, schedulesRes] = await Promise.all([
          employeeAPI.getShifts(),
          employeeAPI.getShiftSchedules()
        ]);
        setShifts(shiftsRes.data);
        setSchedules(schedulesRes.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to load shift data');
        console.error('Error fetching shifts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getShiftStats = (): ShiftStats => {
    return {
      totalShifts: shifts.length,
      activeShifts: shifts.filter(s => s.isActive).length,
      totalEmployees: schedules.length,
      onLeave: 0
    };
  };

  const stats = getShiftStats();

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'morning':
        return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Sun, gradient: 'from-amber-500 to-orange-500' };
      case 'evening':
        return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Sunset, gradient: 'from-indigo-500 to-purple-500' };
      case 'night':
        return { bg: 'bg-slate-100', text: 'text-slate-700', icon: Moon, gradient: 'from-slate-500 to-slate-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded mt-1 animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shift Management</h2>
              <p className="text-sm text-gray-500">Manage shifts and schedules</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-100 rounded-xl">
              <Calendar className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shift Management</h2>
              <p className="text-sm text-gray-500">Manage shifts and schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="gap-2" onClick={() => setShowAddShift(true)}>
              <Plus className="w-4 h-4" />
              Add Shift
            </Button>
            <Button className="gap-2" onClick={() => setShowAddSchedule(true)}>
              <Plus className="w-4 h-4" />
              Assign Schedule
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 opacity-80" />
              <span className="text-2xl font-bold">{stats.totalShifts}</span>
            </div>
            <p className="text-sm opacity-80">Total Shifts</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 opacity-80" />
              <span className="text-2xl font-bold">{stats.activeShifts}</span>
            </div>
            <p className="text-sm opacity-80">Active Shifts</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 opacity-80" />
              <span className="text-2xl font-bold">{stats.totalEmployees}</span>
            </div>
            <p className="text-sm opacity-80">Assigned Employees</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Pause className="w-5 h-5 opacity-80" />
              <span className="text-2xl font-bold">{stats.onLeave}</span>
            </div>
            <p className="text-sm opacity-80">On Leave</p>
          </div>
        </div>

        {/* Shift Cards */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shifts.map((shift, index) => {
              const typeInfo = getShiftTypeColor(shift.type || 'morning');
              const TypeIcon = typeInfo.icon;
              return (
                <div
                  key={shift.id}
                  className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedShift(shift)}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${typeInfo.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${typeInfo.gradient} text-white shadow-lg`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${shift.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {shift.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">{shift.name}</h4>
                  <p className="text-sm text-gray-500 mb-4">{shift.type} shift</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{shift.startTime} - {shift.endTime}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {schedules.filter(s => s.shiftId === shift.id).length} assigned
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Add Shift Card */}
            <button
              onClick={() => setShowAddShift(true)}
              className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 rounded-2xl hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 group"
            >
              <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-violet-100 transition-colors mb-3">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-violet-600" />
              </div>
              <span className="font-medium text-gray-600 group-hover:text-violet-600">Add New Shift</span>
            </button>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                {formatWeekRange()}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const daySchedules = schedules.filter(s => {
                  const scheduleDate = new Date(s.date);
                  return scheduleDate.toDateString() === day.toDateString();
                });
                
                return (
                  <div 
                    key={index}
                    className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-violet-50' : ''}`}
                  >
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-lg font-bold mt-1 ${isToday ? 'text-violet-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </p>
                    {daySchedules.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {daySchedules.slice(0, 2).map((schedule, i) => {
                          const shift = shifts.find(s => s.id === schedule.shiftId);
                          const typeInfo = shift ? getShiftTypeColor(shift.type || 'morning') : getShiftTypeColor('morning');
                          return (
                            <div
                              key={i}
                              className={`text-xs px-2 py-1 rounded-full ${typeInfo.bg} ${typeInfo.text} truncate`}
                            >
                              {shift?.name}
                            </div>
                          );
                        })}
                        {daySchedules.length > 2 && (
                          <span className="text-xs text-gray-500">+{daySchedules.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Add Shift Modal */}
      <Modal
        isOpen={showAddShift}
        onClose={() => setShowAddShift(false)}
        title="Add New Shift"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter shift name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="morning">Morning Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="night">Night Shift</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowAddShift(false)}>
              Cancel
            </Button>
            <Button>Create Shift</Button>
          </div>
        </div>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={showAddSchedule}
        onClose={() => setShowAddSchedule(false)}
        title="Assign Shift Schedule"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select employee</option>
                {schedules.map((schedule, index) => (
                  <option key={index} value={schedule.employeeId}>
                    Employee {schedule.employeeId}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select shift</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowAddSchedule(false)}>
              Cancel
            </Button>
            <Button>Assign Schedule</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ShiftManagement;
