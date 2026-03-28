// components/inventory/SupplierManagement.tsx
import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, Star, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  rating: number;
  status: 'active' | 'inactive';
  materials: string[];
}

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'ABC Materials',
          contact: 'Jane Smith',
          email: 'jane@abc.com',
          phone: '+1-234-567-8900',
          rating: 4.5,
          status: 'active',
          materials: ['Steel Sheets', 'Aluminum Rods', 'Copper Wire']
        },
        {
          id: '2',
          name: 'TechParts Inc.',
          contact: 'Mike Johnson',
          email: 'mike@techparts.com',
          phone: '+1-234-567-8901',
          rating: 4.8,
          status: 'active',
          materials: ['Electronic Components', 'Sensors', 'Motors']
        },
        {
          id: '3',
          name: 'Global Polymers',
          contact: 'Sarah Wilson',
          email: 'sarah@globalpoly.com',
          phone: '+1-234-567-8902',
          rating: 4.2,
          status: 'active',
          materials: ['Plastic Pellets', 'Rubber Gaskets']
        },
      ];
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 800);
  }, []);

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : index < rating
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">{rating}</span>
      </div>
    );
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Supplier Management</h2>
              <p className="text-sm text-gray-500">{suppliers.length} suppliers</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((supplier, index) => (
            <div
              key={supplier.id}
              className="group p-5 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      supplier.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>
                  {renderRating(supplier.rating)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{supplier.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{supplier.phone}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Supplied Materials:</h4>
                <div className="flex flex-wrap gap-2">
                  {supplier.materials.map((material) => (
                    <span
                      key={material}
                      className="px-2.5 py-1 bg-gray-100 text-sm text-gray-600 rounded-lg"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          View All Suppliers <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SupplierManagement;
