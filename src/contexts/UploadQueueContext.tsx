import React, { createContext, useContext, useState } from 'react';
import { storageService } from '../services/storageService';
import { dataService } from '../services/dataService';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface UploadQueueContextType {
  queue: UploadItem[];
  addToQueue: (files: File[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  isUploading: boolean;
}

const UploadQueueContext = createContext<UploadQueueContextType | undefined>(undefined);

export const UploadQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addToQueue = async (files: File[]) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setQueue(prev => [...prev, ...newItems]);
    
    if (!isUploading) {
      processQueue([...queue, ...newItems]);
    }
  };

  const processQueue = async (currentQueue: UploadItem[]) => {
    setIsUploading(true);
    
    for (const item of currentQueue) {
      if (item.status !== 'pending') continue;
      
      try {
        setQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'uploading' } : i
        ));

        const path = `uploads/${Date.now()}-${item.file.name}`;
        const result = await storageService.uploadFile(
          item.file,
          path,
          (progress) => {
            setQueue(prev => prev.map(i => 
              i.id === item.id ? { ...i, progress } : i
            ));
          }
        );

        await dataService.createFile({
          name: item.file.name,
          key: result.path,
          size: item.file.size,
          type: item.file.type,
          ownerId: 'current-user',
          isFolder: false,
        });

        setQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'completed', progress: 100 } : i
        ));
      } catch (error) {
        setQueue(prev => prev.map(i => 
          i.id === item.id ? { 
            ...i, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : i
        ));
      }
    }
    
    setIsUploading(false);
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <UploadQueueContext.Provider value={{
      queue,
      addToQueue,
      removeFromQueue,
      clearQueue,
      isUploading,
    }}>
      {children}
    </UploadQueueContext.Provider>
  );
};

export const useUploadQueue = () => {
  const context = useContext(UploadQueueContext);
  if (!context) {
    throw new Error('useUploadQueue must be used within an UploadQueueProvider');
  }
  return context;
};