// src/pages/sub/SuppliersPage.tsx
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Mail, Phone, MapPin, RefreshCw, Star } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    name: '', contactPerson: '', email: '', phone: '', address: '', paymentTerms: 'Net 30',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await inventoryService.getSuppliers();
      const data = res.data?.data ?? res.data ?? [];
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toastError('Supplier name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      await inventoryService.createSupplier({
        name: form.name,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address: form.address,
        paymentTerms: form.paymentTerms,
        activeStatus: true,
        rating: 0,
      });
      success('Supplier added successfully');
      setShowModal(false);
      setForm({ name: '', contactPerson: '', email: '', phone: '', address: '', paymentTerms: 'Net 30' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add supplier');
    } finally { setSubmitting(false); }
  };

  const filtered = suppliers.filter(s =>
    (s.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contactPerson ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-500 mt-1">Manage your supply chain partners</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No suppliers found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add First Supplier</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s, i) => (
            <div key={s._id ?? s.id ?? i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {(s.name ?? 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    {s.contactPerson && <p className="text-sm text-gray-500">{s.contactPerson}</p>}
                  </div>
                </div>
                {s.activeStatus !== false && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {s.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />{s.email}</p>}
                {s.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />{s.phone}</p>}
                {s.address && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />{s.address}</p>}
                {s.paymentTerms && <p className="flex items-center gap-2"><Star className="w-4 h-4 text-gray-400 flex-shrink-0" />Payment: {s.paymentTerms}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Supplier">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Supplier Name *', type: 'text', required: true, placeholder: 'Steel Corp Ltd.' },
            { id: 'contactPerson', label: 'Contact Person', type: 'text', required: false, placeholder: 'John Smith' },
            { id: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'contact@supplier.com' },
            { id: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: '+1 555 000 0000' },
            { id: 'address', label: 'Address', type: 'text', required: false, placeholder: '123 Industrial Ave' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Adding...' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
