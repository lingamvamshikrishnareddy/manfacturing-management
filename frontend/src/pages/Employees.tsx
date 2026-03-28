// src/pages/Employees.tsx
import React from 'react';
import EmployeeDirectory from '../components/employees/EmployeeDirectory';
import ShiftManagement from '../components/employees/ShiftManagement';
import SkillMatrix from '../components/employees/SkillMatrix';
import AttendanceTracker from '../components/employees/AttendanceTracker';
import { Users, Clock, UserCheck, UserPlus, Award } from 'lucide-react';

const Employees: React.FC = () => {
  const stats = [
    { label: 'Total Employees', value: '248', change: '+12', trend: 'up', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Present Today', value: '225', change: '91%', trend: 'up', icon: UserCheck, color: 'from-green-500 to-green-600' },
    { label: 'Active Shifts', value: '8', change: '3 running', trend: 'neutral', icon: Clock, color: 'from-purple-500 to-purple-600' },
    { label: 'Certifications', value: '1,456', change: '+45', trend: 'up', icon: Award, color: 'from-orange-500 to-orange-600' },
  ];

  const quickActions = [
    { label: 'Add Employee', icon: UserPlus, color: 'bg-blue-500 hover:bg-blue-600', borderColor: 'border-blue-200 hover:border-blue-400' },
    { label: 'Directory', icon: Users, color: 'bg-green-500 hover:bg-green-600', borderColor: 'border-green-200 hover:border-green-400' },
    { label: 'Shifts', icon: Clock, color: 'bg-purple-500 hover:bg-purple-600', borderColor: 'border-purple-200 hover:border-purple-400' },
    { label: 'Attendance', icon: UserCheck, color: 'bg-orange-500 hover:bg-orange-600', borderColor: 'border-orange-200 hover:border-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage employees, shifts, attendance, and skills</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              className={`flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border-2 ${action.borderColor} 
                         hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group`}
            >
              <div className={`p-1.5 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 
                       transition-all duration-300 animate-fade-in-up group cursor-pointer"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' : 
                stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <EmployeeDirectory />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <ShiftManagement />
          </div>
        </div>
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <SkillMatrix />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <AttendanceTracker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
