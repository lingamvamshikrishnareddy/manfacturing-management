// src/pages/sub/StockPage.tsx
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const StockPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    itemName: '', sku: '', category: '', quantity: '', unit: '', reorderLevel: '', unitCost: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      // Try /items first, fall back to /stock
      let res;
      try { res = await inventoryService.getItems(); }
      catch { res = await inventoryService.getStock(); }
      const data = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.quantity) {
      toastError('Item name and quantity are required');
      return;
    }
    setSubmitting(true);
    try {
      await inventoryService.createItem({
        itemName: form.itemName,
        sku: form.sku,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        minQuantity: Number(form.reorderLevel) || 0,
        unitPrice: Number(form.unitCost) || 0,
        location: 'Warehouse',
        supplier: 'TBD',
      });
      success('Item added to inventory');
      setShowModal(false);
      setForm({ itemName: '', sku: '', category: '', quantity: '', unit: '', reorderLevel: '', unitCost: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add item');
    } finally { setSubmitting(false); }
  };

  const getStatus = (item: any) => {
    const qty = item.quantity ?? item.currentStock ?? 0;
    const min = item.minQuantity ?? item.minStock ?? 0;
    const max = item.maxQuantity ?? item.maxStock ?? 100;
    if (qty <= min) return 'low';
    if (qty >= max * 0.9) return 'full';
    return 'normal';
  };

  const statusStyles = {
    low: { bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', icon: AlertTriangle, iconColor: 'text-red-500', bar: 'bg-red-500' },
    full: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', icon: TrendingUp, iconColor: 'text-blue-500', bar: 'bg-blue-500' },
    normal: { bg: 'bg-green-50', badge: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-500', bar: 'bg-green-500' },
  };

  const filtered = items.filter(item => {
    const name = (item.itemName ?? item.name ?? '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || getStatus(item) === statusFilter);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Levels</h1>
          <p className="text-gray-500 mt-1">Manage inventory items and stock</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No inventory items found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add First Item</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((item, i) => {
            const st = getStatus(item);
            const s = statusStyles[st];
            const qty = item.quantity ?? item.currentStock ?? 0;
            const max = item.maxQuantity ?? item.maxStock ?? 100;
            const pct = Math.min((qty / max) * 100, 100);
            const Icon = s.icon;
            return (
              <div key={item._id ?? item.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${s.bg} flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${s.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{item.itemName ?? item.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
                          {st === 'low' ? 'Low Stock' : st === 'full' ? 'Full' : 'Normal'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{item.category ?? 'Uncategorized'} • {item.location ?? 'Warehouse'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-gray-900">{qty.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{item.unit ?? 'units'}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Stock Level</span>
                    <span className="font-medium text-gray-700">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Inventory Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'itemName', label: 'Item Name *', type: 'text', required: true, placeholder: 'Steel Sheets' },
            { id: 'sku', label: 'SKU', type: 'text', required: false, placeholder: 'SKU-001' },
            { id: 'category', label: 'Category', type: 'text', required: false, placeholder: 'Raw Material' },
            { id: 'quantity', label: 'Quantity *', type: 'number', required: true, placeholder: '100' },
            { id: 'unit', label: 'Unit', type: 'text', required: false, placeholder: 'kg, sheets, pieces...' },
            { id: 'reorderLevel', label: 'Reorder Level', type: 'number', required: false, placeholder: '20' },
            { id: 'unitCost', label: 'Unit Cost ($)', type: 'number', required: false, placeholder: '25.50' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockPage;
