import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../shared/Button';
import { Calendar as CalendarComponent } from '../shared/Calender';
import {
  AttendanceRecord,
  AttendanceStats,
  AttendanceView,
} from '../../types/attendance';
import { employeeAPI } from '../../services/api/employeeAPI';

const AttendanceTracker: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<AttendanceView>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await employeeAPI.getAttendance();
        // Transform backend data to match frontend interface
        const transformedRecords: AttendanceRecord[] = response.data.map((record: any) => ({
          id: record.id,
          employeeId: record.employeeId,
          employeeName: record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Unknown',
          date: record.date,
          timeIn: record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '--:--',
          timeOut: record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '--:--',
          status: record.status,
          notes: record.notes
        }));
        setRecords(transformedRecords);
        setError(null);
      } catch (err: any) {
        setError('Failed to load attendance data');
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getAttendanceStats = (): AttendanceStats => {
    const today = records.filter(record => 
      new Date(record.date).toDateString() === new Date().toDateString()
    );

    return {
      present: today.filter(r => r.status === 'present').length,
      absent: today.filter(r => r.status === 'absent').length,
      late: today.filter(r => r.status === 'late').length,
      halfDay: today.filter(r => r.status === 'half-day').length,
    };
  };

  const stats = getAttendanceStats();
  const total = stats.present + stats.absent + stats.late + stats.halfDay;

  // Filter records for the selected date
  const filteredRecords = records.filter(record =>
    new Date(record.date).toDateString() === selectedDate.toDateString()
  ).filter(record =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Present' };
      case 'absent':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Absent' };
      case 'late':
        return { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle, label: 'Late' };
      case 'half-day':
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, label: 'Half Day' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: 'Unknown' };
    }
  };

  const statCards = [
    { label: 'Present', value: stats.present, total, color: 'emerald', icon: CheckCircle, bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Absent', value: stats.absent, total, color: 'red', icon: XCircle, bg: 'from-red-500 to-red-600' },
    { label: 'Late', value: stats.late, total, color: 'amber', icon: AlertTriangle, bg: 'from-amber-500 to-amber-600' },
    { label: 'Half Day', value: stats.halfDay, total, color: 'orange', icon: Clock, bg: 'from-orange-500 to-orange-600' },
  ];

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
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
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
              <h2 className="text-xl font-bold text-gray-900">Attendance Tracker</h2>
              <p className="text-sm text-gray-500">Track employee attendance</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-500">{error}</p>
            <Button className="mt-4">Try Again</Button>
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
            <div className="p-2.5 bg-violet-100 rounded-xl">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Attendance Tracker</h2>
              <p className="text-sm text-gray-500">Track and manage employee attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button>Mark Attendance</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bg} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`} />
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.bg} text-white shadow-lg`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.bg} rounded-full transition-all duration-1000`}
                  style={{ width: total > 0 ? `${(stat.value / total) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{total > 0 ? Math.round((stat.value / total) * 100) : 0}% of total</p>
            </div>
          ))}
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setView('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'daily' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {view === 'daily' ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time In</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Out</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => {
                      const statusBadge = getStatusBadge(record.status);
                      return (
                        <tr 
                          key={record.id} 
                          className="hover:bg-gray-50 transition-colors animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                                {record.employeeName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium text-gray-900">{record.employeeName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-mono">{record.timeIn}</td>
                          <td className="px-6 py-4 text-gray-600 font-mono">{record.timeOut}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                              <statusBadge.icon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{record.notes || '-'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No attendance records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <CalendarComponent
              value={selectedDate}
              onChange={setSelectedDate}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceTracker;
