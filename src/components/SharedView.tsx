import React, { useState, useEffect } from 'react';
import { Share2, Link, Users, Clock, Eye } from 'lucide-react';

export const SharedView: React.FC = () => {
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'shared-by-me' | 'shared-with-me'>('shared-by-me');

  useEffect(() => {
    // Load shared files
    setSharedFiles([]);
    setSharedWithMe([]);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Share2 className="text-blue-600" />
        Shared Files
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex">
        <button
          onClick={() => setActiveTab('shared-by-me')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'shared-by-me'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Shared by me
        </button>
        <button
          onClick={() => setActiveTab('shared-with-me')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'shared-with-me'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Shared with me
        </button>
      </div>

      {activeTab === 'shared-by-me' ? (
        sharedFiles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <Share2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No files shared</p>
            <p className="text-sm text-gray-400 mt-2">Files you share will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sharedFiles.map((share) => (
              <div key={share.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{share.fileName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {share.sharedWith}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {share.expiresAt || 'No expiration'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={16} />
                        {share.accessCount} views
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                    <Link size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        sharedWithMe.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No files shared with you</p>
            <p className="text-sm text-gray-400 mt-2">Files others share with you will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sharedWithMe.map((file) => (
              <div key={file.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium">{file.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Shared by {file.ownerName}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};