import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Upload, 
  FolderPlus, 
  Search, 
  Grid, 
  List, 
  File,
  Folder,
  MoreVertical,
  Download,
  Trash2,
  Share2,
  Star,
  StarOff
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

export const FileExplorer: React.FC = () => {
  const { folderId } = useParams();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadFiles();
    loadUser();
  }, [folderId]);

  const loadUser = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      // For demo, create some sample files if none exist
      const userFiles = await dataService.listFiles(currentUser?.userId || 'demo');
      
      if (userFiles.length === 0) {
        // Create sample data
        const sampleFiles = [
          { name: 'Documents', isFolder: true, size: 0, key: 'folders/documents' },
          { name: 'Images', isFolder: true, size: 0, key: 'folders/images' },
          { name: 'Videos', isFolder: true, size: 0, key: 'folders/videos' },
          { name: 'Welcome.pdf', isFolder: false, size: 1024000, key: 'files/welcome.pdf', type: 'application/pdf' },
        ];
        
        for (const file of sampleFiles) {
          await dataService.createFile({
            ...file,
            ownerId: currentUser?.userId || 'demo',
            parentId: folderId || null,
          });
        }
        
        setFiles(sampleFiles);
      } else {
        setFiles(userFiles);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      // Use local state for demo
      setFiles([
        { id: '1', name: 'Documents', isFolder: true, size: 0 },
        { id: '2', name: 'Images', isFolder: true, size: 0 },
        { id: '3', name: 'Welcome.pdf', isFolder: false, size: 1024000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `uploads/${Date.now()}-${file.name}`;
      const result = await storageService.uploadFile(
        file,
        path,
        (progress) => console.log(`Upload progress: ${progress}%`)
      );

      await dataService.createFile({
        name: file.name,
        key: result.path,
        size: file.size,
        type: file.type,
        ownerId: currentUser?.userId || 'demo',
        parentId: folderId || null,
        isFolder: false,
      });

      await loadFiles();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const createFolder = async () => {
    const name = window.prompt('Enter folder name:');
    if (!name) return;

    try {
      await dataService.createFile({
        name,
        key: `folders/${Date.now()}-${name}`,
        size: 0,
        ownerId: currentUser?.userId || 'demo',
        parentId: folderId || null,
        isFolder: true,
      });
      await loadFiles();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await dataService.deleteFile(fileId);
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <label className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
            <Upload size={20} className="inline mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <button
            onClick={createFolder}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FolderPlus size={20} className="inline mr-2" />
            New Folder
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600' : ''}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Folder size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No files found</p>
          <p className="text-sm text-gray-400 mt-2">Upload files or create folders to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                {file.isFolder ? (
                  <Folder size={40} className="text-blue-500" />
                ) : (
                  <File size={40} className="text-gray-400" />
                )}
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical size={16} />
                </button>
              </div>
              <p className="text-sm font-medium truncate">{file.name}</p>
              {!file.isFolder && (
                <p className="text-xs text-gray-500 mt-1">
                  {storageService.formatFileSize(file.size || 0)}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Size</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Modified</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {file.isFolder ? (
                      <Folder size={20} className="text-blue-500" />
                    ) : (
                      <File size={20} className="text-gray-400" />
                    )}
                    <span className="text-sm">{file.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {file.isFolder ? '-' : storageService.formatFileSize(file.size || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Download size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                        <Share2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteFile(file.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};