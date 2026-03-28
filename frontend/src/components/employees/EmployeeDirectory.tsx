// components/employees/EmployeeDirectory.tsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Building2, Plus, Search, ArrowRight } from 'lucide-react';
import { Employee } from '../../types';
import { employeeAPI } from '../../services/api/employeeAPI';
import { CardSkeleton } from '../ui/Skeleton';

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading
    setTimeout(async () => {
      try {
        const response = await employeeAPI.getEmployees();
        setEmployees(response.data);
      } catch (err) {
        // Use mock data on error
        const mockEmployees: Employee[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            employeeId: 'EMP001',
            department: 'Production',
            position: 'Production Manager',
            role: 'supervisor',
            shift: 'Morning',
            status: 'active',
            joiningDate: '2022-01-15',
            skills: ['Production Planning', 'Team Leadership'],
            certifications: ['ISO 9001', 'Six Sigma'],
            createdAt: '2022-01-15T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            employeeId: 'EMP002',
            department: 'Quality',
            position: 'Quality Inspector',
            role: 'operator',
            shift: 'Morning',
            status: 'active',
            joiningDate: '2022-03-20',
            skills: ['Quality Control', 'Inspection'],
            certifications: ['QA Certified'],
            createdAt: '2022-03-20T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@company.com',
            employeeId: 'EMP003',
            department: 'Maintenance',
            position: 'Maintenance Technician',
            role: 'technician',
            shift: 'Evening',
            status: 'active',
            joiningDate: '2021-06-10',
            skills: ['Equipment Repair', 'Preventive Maintenance'],
            certifications: ['Electrical Safety'],
            createdAt: '2021-06-10T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ];
        setEmployees(mockEmployees);
      } finally {
        setLoading(false);
      }
    }, 800);
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
      case 'on-leave':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      default:
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
              <p className="text-sm text-gray-500">{filteredEmployees.length} employees</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmployees.map((employee, index) => {
            const statusStyles = getStatusStyles(employee.status);

            return (
              <div
                key={employee.id}
                className="group p-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusStyles.dot}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                        {employee.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{employee.position}</p>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {employee.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {employee.shift}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                    </span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
