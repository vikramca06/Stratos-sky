import React, { useState } from 'react';
import { User, Mail, Shield, CreditCard, Bell, Moon } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Storage Plan</label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Free Plan</span>
                    <button className="text-blue-600 hover:underline">Upgrade</button>
                  </div>
                  <div className="text-sm text-gray-500">2.5 GB of 5 GB used</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                  <p className="text-sm mb-3">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Enable 2FA
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Current password"
                  />
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="New password"
                  />
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Confirm new password"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Upgrade to Premium</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get unlimited storage and advanced features</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                'Email me when someone shares a file with me',
                'Email me about product updates',
                'Email me about security alerts',
              ].map((label, i) => (
                <label key={i} className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked={i === 0} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['Light', 'Dark', 'System'].map((theme) => (
                    <button
                      key={theme}
                      className="p-4 border-2 rounded-lg hover:border-blue-600 transition-colors"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};