import React from 'react';
import { Plus, Clock } from 'lucide-react';

interface MaterialRequest {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  requestDate: string;
}

const MaterialRequests: React.FC = () => {
  const [requests, setRequests] = React.useState<MaterialRequest[]>([]);
  const [showNewRequest, setShowNewRequest] = React.useState(false);

  React.useEffect(() => {
    // TODO: Fetch from API
    const mockRequests: MaterialRequest[] = [
      {
        id: '1',
        material: 'Raw Material A',
        quantity: 100,
        unit: 'kg',
        requestedBy: 'John Doe',
        department: 'Production',
        status: 'pending',
        priority: 'high',
        requestDate: '2024-01-25'
      },
      // Add more mock requests...
    ];
    setRequests(mockRequests);
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    setShowNewRequest(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Material Requests</h2>
          <p className="text-sm text-gray-500">Manage material requisitions</p>
        </div>
        <button
          onClick={() => setShowNewRequest(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white p-4 rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{request.material}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">
                    {request.quantity} {request.unit}
                  </span>
                  <span className="text-sm text-gray-500">
                    {request.department}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(request.status)}`}>
                  {request.status}
                </span>
                <span className={`text-sm ${getPriorityStyle(request.priority)}`}>
                  {request.priority}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(request.requestDate).toLocaleDateString()}
              </div>
              <div>
                Requested by: {request.requestedBy}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">New Material Request</h3>
            <form onSubmit={handleNewRequest} className="space-y-4">
              {/* Form fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Material
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>
              {/* Add more form fields */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewRequest(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequests;