import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/shared/Button';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-primary-600">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-primary-100">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">{user.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white capitalize">{user.role}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">{user.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
