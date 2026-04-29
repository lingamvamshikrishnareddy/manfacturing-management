// components/employees/EmployeeDirectory.tsx — Real API integration (no mock fallback)
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Building2, Plus, Search, ArrowRight } from 'lucide-react';
import { employeeService } from '../../services/api';
import { Modal } from '../shared/Modal';
import { useToast } from '../shared/Toast';
import { CardSkeleton } from '../ui/Skeleton';

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', department: '', position: '', role: 'operator', shift: 'Morning',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await employeeService.getAll();
      const data = res.data?.data ?? res.data ?? [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.password.trim()) {
      toastError('First name, email, and password are required');
      return;
    }
    setSubmitting(true);
    try {
      await employeeService.create({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        department: form.department,
        position: form.position,
        role: form.role,
        shift: form.shift,
        status: 'active',
        joiningDate: new Date().toISOString().split('T')[0],
        employeeId: `EMP-${Date.now()}`,
      });
      success('Employee added successfully');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', department: '', position: '', role: 'operator', shift: 'Morning' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add employee');
    } finally { setSubmitting(false); }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
      case 'on-leave': return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      default: return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-6"><CardSkeleton /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}<button onClick={fetchData} className="ml-3 underline text-sm">Retry</button></div>;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl"><User className="h-5 w-5 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
              <p className="text-sm text-gray-500">{filteredEmployees.length} employees</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="p-6">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No employees found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEmployees.map((employee, index) => {
              const statusStyles = getStatusStyles(employee.status);
              return (
                <div key={employee._id ?? employee.id ?? index}
                  className="group p-4 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {(employee.firstName ?? '?').charAt(0)}{(employee.lastName ?? '').charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusStyles.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{employee.firstName} {employee.lastName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>{employee.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{employee.position}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {employee.department && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{employee.department}</span>}
                        {employee.shift && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{employee.shift}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                      {employee.phone && <Phone className="w-4 h-4" />}
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Profile <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Employee" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'firstName', label: 'First Name *', type: 'text', required: true, placeholder: 'John' },
              { id: 'lastName', label: 'Last Name', type: 'text', required: false, placeholder: 'Doe' },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} required={f.required} placeholder={f.placeholder}
                  value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
          </div>
          {[
            { id: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'john.doe@company.com' },
            { id: 'password', label: 'Password *', type: 'password', required: true, placeholder: '••••••••' },
            { id: 'department', label: 'Department', type: 'text', required: false, placeholder: 'Production, Quality...' },
            { id: 'position', label: 'Position', type: 'text', required: false, placeholder: 'Production Manager...' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {['operator', 'technician', 'supervisor', 'manager', 'admin'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select value={form.shift} onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;
