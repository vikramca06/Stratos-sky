import React from 'react';
import { Users, HardDrive, Activity, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-blue-600" size={32} />
            <span className="text-2xl font-bold">1,234</span>
          </div>
          <p className="text-gray-500">Total Users</p>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="text-green-600" size={32} />
            <span className="text-2xl font-bold">2.4 TB</span>
          </div>
          <p className="text-gray-500">Storage Used</p>
          <p className="text-sm text-green-600 mt-2">+8% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="text-orange-600" size={32} />
            <span className="text-2xl font-bold">89k</span>
          </div>
          <p className="text-gray-500">Total Activities</p>
          <p className="text-sm text-green-600 mt-2">+23% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-purple-600" size={32} />
            <span className="text-2xl font-bold">$12.4k</span>
          </div>
          <p className="text-gray-500">Revenue</p>
          <p className="text-sm text-green-600 mt-2">+18% from last month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Plan</th>
                <th className="px-4 py-2 text-left">Storage</th>
                <th className="px-4 py-2 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t dark:border-gray-700">
                <td className="px-4 py-3">John Doe</td>
                <td className="px-4 py-3">john@example.com</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Premium</span>
                </td>
                <td className="px-4 py-3">24 GB</td>
                <td className="px-4 py-3">2 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};