// src/pages/sub/AttendancePage.tsx
import React, { useState, useEffect } from 'react';
import { Users, Plus, Calendar, Search, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { employeeService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    employeeId: '', employeeName: '', date: new Date().toISOString().split('T')[0],
    checkIn: '', checkOut: '', status: 'present',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await employeeService.getAttendance({ date: dateFilter });
      const data = res.data?.data ?? res.data ?? [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance records');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId.trim() || !form.date) {
      toastError('Employee ID and date are required');
      return;
    }
    setSubmitting(true);
    try {
      await employeeService.recordAttendance({
        employeeId: form.employeeId,
        employeeName: form.employeeName,
        date: form.date,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        status: form.status,
      });
      success('Attendance recorded');
      setShowModal(false);
      setForm({ employeeId: '', employeeName: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'present' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to record attendance');
    } finally { setSubmitting(false); }
  };

  const statusConfig = {
    present: { icon: CheckCircle, color: 'text-green-500', badge: 'bg-green-100 text-green-700' },
    absent: { icon: XCircle, color: 'text-red-500', badge: 'bg-red-100 text-red-700' },
    late: { icon: Clock, color: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
    'on-leave': { icon: Calendar, color: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  };

  const filtered = records.filter(r =>
    (r.employeeName ?? r.employeeId ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const lateCount = records.filter(r => r.status === 'late').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">Track daily employee attendance</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Record
          </button>
        </div>
      </div>

      {/* Summary row */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Present', count: presentCount, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Absent', count: absentCount, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Late', count: lateCount, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-sm text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No attendance records for {new Date(dateFilter + 'T12:00:00').toLocaleDateString()}</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Record Attendance</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((rec, i) => {
            const cfg = statusConfig[rec.status as keyof typeof statusConfig] ?? statusConfig.present;
            const Icon = cfg.icon;
            return (
              <div key={rec._id ?? rec.id ?? i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {(rec.employeeName ?? rec.employeeId ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{rec.employeeName ?? rec.employeeId}</p>
                    <div className="flex gap-3 text-xs text-gray-400">
                      {rec.checkIn && <span>In: {rec.checkIn}</span>}
                      {rec.checkOut && <span>Out: {rec.checkOut}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cfg.badge}`}>{rec.status}</span>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Attendance">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'employeeId', label: 'Employee ID *', type: 'text', required: true, placeholder: 'EMP001' },
            { id: 'employeeName', label: 'Employee Name', type: 'text', required: false, placeholder: 'John Doe' },
            { id: 'date', label: 'Date *', type: 'date', required: true, placeholder: '' },
            { id: 'checkIn', label: 'Check In Time', type: 'time', required: false, placeholder: '' },
            { id: 'checkOut', label: 'Check Out Time', type: 'time', required: false, placeholder: '' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {['present', 'absent', 'late', 'on-leave'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Recording...' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
