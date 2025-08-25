import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, File, Folder, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { storageService } from '../services/storageService';

export const TrashView: React.FC = () => {
  const [trashedFiles, setTrashedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    setLoading(true);
    try {
      // In a real app, filter by deletedAt field
      setTrashedFiles([]);
    } catch (error) {
      console.error('Error loading trash:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreFile = async (fileId: string) => {
    try {
      await dataService.updateFile(fileId, { deletedAt: null });
      await loadTrashedFiles();
    } catch (error) {
      console.error('Error restoring file:', error);
    }
  };

  const permanentlyDelete = async (fileId: string) => {
    if (!window.confirm('This will permanently delete the file. This action cannot be undone.')) {
      return;
    }
    try {
      await dataService.deleteFile(fileId);
      await loadTrashedFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const emptyTrash = async () => {
    if (!window.confirm('This will permanently delete all files in trash. This action cannot be undone.')) {
      return;
    }
    try {
      for (const file of trashedFiles) {
        await dataService.deleteFile(file.id);
      }
      setTrashedFiles([]);
    } catch (error) {
      console.error('Error emptying trash:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Trash2 className="text-gray-600" />
          Trash
        </h2>
        {trashedFiles.length > 0 && (
          <button
            onClick={emptyTrash}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Empty Trash
          </button>
        )}
      </div>

      {trashedFiles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Trash is empty</p>
          <p className="text-sm text-gray-400 mt-2">Deleted files will appear here</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Size</th>
                <th className="px-4 py-2 text-left">Deleted</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trashedFiles.map((file) => (
                <tr key={file.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {file.isFolder ? (
                      <Folder size={20} className="text-gray-400" />
                    ) : (
                      <File size={20} className="text-gray-400" />
                    )}
                    <span>{file.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {file.isFolder ? '-' : storageService.formatFileSize(file.size || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(file.deletedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => restoreFile(file.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                    >
                      <RefreshCw size={16} className="inline mr-1" />
                      Restore
                    </button>
                    <button
                      onClick={() => permanentlyDelete(file.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Auto-delete policy</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Files in trash will be automatically deleted after 30 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};