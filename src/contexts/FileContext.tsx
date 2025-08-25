import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

interface FileContextType {
  files: any[];
  loading: boolean;
  selectedFiles: Set<string>;
  refreshFiles: () => Promise<void>;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  clearSelection: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const refreshFiles = async () => {
    setLoading(true);
    try {
      // Load files from data service
      const userFiles = await dataService.listFiles('current-user');
      setFiles(userFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const selectFile = (fileId: string) => {
    setSelectedFiles(prev => new Set(prev).add(fileId));
  };

  const deselectFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  return (
    <FileContext.Provider value={{
      files,
      loading,
      selectedFiles,
      refreshFiles,
      selectFile,
      deselectFile,
      clearSelection,
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};