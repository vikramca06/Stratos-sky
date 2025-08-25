import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { UploadQueueProvider, useUploadQueue, QueueItem } from '../../../contexts/UploadQueueContext';
import React from 'react';

describe('UploadQueueContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UploadQueueProvider>{children}</UploadQueueProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Queue Management', () => {
    it('should add items to queue', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const items: QueueItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'test.pdf',
          path: '/test.pdf',
          parentPath: '/',
          status: 'pending',
          size: 1024
        }
      ];

      act(() => {
        result.current.addToQueue(items);
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0]).toEqual(items[0]);
      expect(result.current.totalItems).toBe(1);
    });

    it('should filter out invalid items', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const items: any[] = [
        {
          id: '1',
          type: 'file',
          name: 'valid.pdf',
          path: '/valid.pdf',
          parentPath: '/',
          status: 'pending'
        },
        null,
        undefined,
        {
          // Missing id
          type: 'file',
          name: 'invalid.pdf',
          path: '/invalid.pdf',
          parentPath: '/',
          status: 'pending'
        },
        {
          id: '2',
          // Missing name
          type: 'file',
          path: '/invalid2.pdf',
          parentPath: '/',
          status: 'pending'
        }
      ];

      act(() => {
        result.current.addToQueue(items);
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].id).toBe('1');
    });

    it('should prevent duplicate items', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const item: QueueItem = {
        id: '1',
        type: 'file',
        name: 'test.pdf',
        path: '/test.pdf',
        parentPath: '/',
        status: 'pending'
      };

      act(() => {
        result.current.addToQueue([item]);
        result.current.addToQueue([item]); // Try to add duplicate
      });

      expect(result.current.queue).toHaveLength(1);
    });

    it('should update queue item', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const item: QueueItem = {
        id: '1',
        type: 'file',
        name: 'test.pdf',
        path: '/test.pdf',
        parentPath: '/',
        status: 'pending'
      };

      act(() => {
        result.current.addToQueue([item]);
      });

      act(() => {
        result.current.updateQueueItem('1', { status: 'completed', progress: 100 });
      });

      expect(result.current.queue[0].status).toBe('completed');
      expect(result.current.queue[0].progress).toBe(100);
      expect(result.current.completedItems).toBe(1);
    });

    it('should handle updating non-existent item', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      act(() => {
        result.current.updateQueueItem('non-existent', { status: 'completed' });
      });

      expect(result.current.queue).toHaveLength(0);
    });

    it('should remove item from queue', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const items: QueueItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'test1.pdf',
          path: '/test1.pdf',
          parentPath: '/',
          status: 'pending'
        },
        {
          id: '2',
          type: 'file',
          name: 'test2.pdf',
          path: '/test2.pdf',
          parentPath: '/',
          status: 'pending'
        }
      ];

      act(() => {
        result.current.addToQueue(items);
      });

      act(() => {
        result.current.removeFromQueue('1');
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].id).toBe('2');
    });

    it('should clear queue', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const items: QueueItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'test1.pdf',
          path: '/test1.pdf',
          parentPath: '/',
          status: 'pending'
        },
        {
          id: '2',
          type: 'file',
          name: 'test2.pdf',
          path: '/test2.pdf',
          parentPath: '/',
          status: 'pending'
        }
      ];

      act(() => {
        result.current.addToQueue(items);
      });

      act(() => {
        result.current.clearQueue();
      });

      expect(result.current.queue).toHaveLength(0);
      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('Queue Processing', () => {
    it('should process queue with processor', async () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });
      const mockProcessor = vi.fn().mockResolvedValue(undefined);

      const item: QueueItem = {
        id: '1',
        type: 'file',
        name: 'test.pdf',
        path: '/test.pdf',
        parentPath: '/',
        status: 'pending'
      };

      act(() => {
        result.current.setUploadProcessor(mockProcessor);
        result.current.addToQueue([item]);
      });

      await act(async () => {
        await result.current.processQueue();
      });

      await waitFor(() => {
        expect(mockProcessor).toHaveBeenCalledWith(item);
      });
    });

    it('should handle processor errors', async () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });
      const mockProcessor = vi.fn().mockRejectedValue(new Error('Upload failed'));

      const item: QueueItem = {
        id: '1',
        type: 'file',
        name: 'test.pdf',
        path: '/test.pdf',
        parentPath: '/',
        status: 'pending'
      };

      act(() => {
        result.current.setUploadProcessor(mockProcessor);
        result.current.addToQueue([item]);
      });

      await act(async () => {
        await result.current.processQueue();
      });

      await waitFor(() => {
        expect(mockProcessor).toHaveBeenCalledWith(item);
        expect(result.current.isProcessing).toBe(false);
      });
    });

    it('should prevent concurrent processing', async () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });
      let processCount = 0;
      const mockProcessor = vi.fn().mockImplementation(async () => {
        processCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const items: QueueItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'test1.pdf',
          path: '/test1.pdf',
          parentPath: '/',
          status: 'pending'
        },
        {
          id: '2',
          type: 'file',
          name: 'test2.pdf',
          path: '/test2.pdf',
          parentPath: '/',
          status: 'pending'
        }
      ];

      act(() => {
        result.current.setUploadProcessor(mockProcessor);
        result.current.addToQueue(items);
      });

      // Try to start processing multiple times
      await act(async () => {
        result.current.processQueue();
        result.current.processQueue();
        result.current.processQueue();
      });

      // Wait for processing to complete
      await waitFor(() => {
        expect(result.current.isProcessing).toBe(false);
      }, { timeout: 500 });

      // Should have processed items only once
      expect(mockProcessor).toHaveBeenCalledTimes(2); // Two items processed once each
    });

    it('should process only pending and failed items', async () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });
      const mockProcessor = vi.fn().mockResolvedValue(undefined);

      const items: QueueItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'test1.pdf',
          path: '/test1.pdf',
          parentPath: '/',
          status: 'pending'
        },
        {
          id: '2',
          type: 'file',
          name: 'test2.pdf',
          path: '/test2.pdf',
          parentPath: '/',
          status: 'completed'
        },
        {
          id: '3',
          type: 'file',
          name: 'test3.pdf',
          path: '/test3.pdf',
          parentPath: '/',
          status: 'failed'
        }
      ];

      act(() => {
        result.current.setUploadProcessor(mockProcessor);
        result.current.addToQueue(items);
      });

      await act(async () => {
        await result.current.processQueue();
      });

      await waitFor(() => {
        expect(mockProcessor).toHaveBeenCalledTimes(2);
        expect(mockProcessor).toHaveBeenCalledWith(items[0]);
        expect(mockProcessor).toHaveBeenCalledWith(items[2]);
        expect(mockProcessor).not.toHaveBeenCalledWith(items[1]);
      });
    });
  });

  describe('Statistics', () => {
    it('should track completed items', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const items: QueueItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'test1.pdf',
          path: '/test1.pdf',
          parentPath: '/',
          status: 'completed'
        },
        {
          id: '2',
          type: 'file',
          name: 'test2.pdf',
          path: '/test2.pdf',
          parentPath: '/',
          status: 'pending'
        },
        {
          id: '3',
          type: 'file',
          name: 'test3.pdf',
          path: '/test3.pdf',
          parentPath: '/',
          status: 'completed'
        }
      ];

      act(() => {
        result.current.addToQueue(items);
      });

      expect(result.current.completedItems).toBe(2);
    });

    it('should track failed items', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      const items: QueueItem[] = [
        {
          id: '1',
          type: 'file',
          name: 'test1.pdf',
          path: '/test1.pdf',
          parentPath: '/',
          status: 'failed'
        },
        {
          id: '2',
          type: 'file',
          name: 'test2.pdf',
          path: '/test2.pdf',
          parentPath: '/',
          status: 'pending'
        }
      ];

      act(() => {
        result.current.addToQueue(items);
      });

      expect(result.current.failedItems).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useUploadQueue());
      }).toThrow('useUploadQueue must be used within an UploadQueueProvider');

      console.error = originalError;
    });

    it('should handle invalid items gracefully', () => {
      const { result } = renderHook(() => useUploadQueue(), { wrapper });

      act(() => {
        result.current.addToQueue([null as any, undefined as any, {} as any]);
      });

      expect(result.current.queue).toHaveLength(0);
    });
  });
});