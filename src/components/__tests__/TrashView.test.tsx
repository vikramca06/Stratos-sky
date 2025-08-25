import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrashView from '../../../components/TrashView';
import { FileItem } from '../../../types';

describe('TrashView', () => {
  const mockOnRestore = vi.fn();
  const mockOnDeletePermanently = vi.fn();
  const mockOnEmptyTrash = vi.fn();

  const mockFiles: FileItem[] = [
    {
      id: '1',
      name: 'document.pdf',
      type: 'document',
      size: 1024, // 1024 KB = 1 MB
      lastModified: '2024-01-15T10:00:00Z',
      parentId: null,
      ownerEmail: 'test@example.com',
      deletedAt: '2024-01-20T10:00:00Z',
      sharedWith: [],
      tags: []
    },
    {
      id: '2',
      name: 'images',
      type: 'folder',
      size: 0,
      lastModified: '2024-01-10T10:00:00Z',
      parentId: null,
      ownerEmail: 'test@example.com',
      deletedAt: '2024-01-19T10:00:00Z',
      sharedWith: [],
      tags: []
    },
    {
      id: '3',
      name: 'spreadsheet.xlsx',
      type: 'spreadsheet',
      size: 5242880, // 5242880 KB = 5 GB
      lastModified: '2024-01-12T10:00:00Z',
      parentId: null,
      ownerEmail: 'test@example.com',
      deletedAt: '2024-01-18T10:00:00Z',
      sharedWith: [],
      tags: []
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render trash view with files', () => {
      render(
        <TrashView
          files={mockFiles}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.getByText('Trash')).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('images')).toBeInTheDocument();
      expect(screen.getByText('spreadsheet.xlsx')).toBeInTheDocument();
    });

    it('should show empty state when no files', () => {
      render(
        <TrashView
          files={[]}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.getByText('The trash is empty')).toBeInTheDocument();
      expect(screen.getByText('Deleted items will appear here.')).toBeInTheDocument();
    });

    it('should display file sizes correctly', () => {
      render(
        <TrashView
          files={mockFiles}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      // 1024 KB = 1.0 MB
      expect(screen.getByText('1.0 MB')).toBeInTheDocument();
      // 5242880 KB = 5.0 GB
      expect(screen.getByText('5.0 GB')).toBeInTheDocument();
    });

    it('should not show size for folders', () => {
      const folderOnly = [mockFiles[1]];
      render(
        <TrashView
          files={folderOnly}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      // Check that the folder row doesn't have a size display
      const folderRow = screen.getByText('images').closest('.flex');
      expect(folderRow?.textContent).not.toMatch(/\d+\s*(KB|MB|GB)/);
    });

    it('should show deletion dates', () => {
      render(
        <TrashView
          files={mockFiles}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      // Date format may vary based on locale
      expect(screen.getByText(/Deleted on/)).toBeInTheDocument();
    });

    it('should show Empty Trash button when files exist', () => {
      render(
        <TrashView
          files={mockFiles}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.getByRole('button', { name: 'Empty Trash' })).toBeInTheDocument();
    });

    it('should not show Empty Trash button when no files', () => {
      render(
        <TrashView
          files={[]}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.queryByRole('button', { name: 'Empty Trash' })).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onRestore when Restore button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TrashView
          files={mockFiles}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      const restoreButtons = screen.getAllByRole('button', { name: 'Restore' });
      await user.click(restoreButtons[0]);

      expect(mockOnRestore).toHaveBeenCalledWith(mockFiles[0]);
    });

    it('should call onDeletePermanently when Delete Forever button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TrashView
          files={mockFiles}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete Forever' });
      await user.click(deleteButtons[1]);

      expect(mockOnDeletePermanently).toHaveBeenCalledWith(mockFiles[1]);
    });

    it('should call onEmptyTrash when Empty Trash button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TrashView
          files={mockFiles}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Empty Trash' }));

      expect(mockOnEmptyTrash).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle files with missing deletedAt gracefully', () => {
      const filesWithMissingDate = [
        {
          ...mockFiles[0],
          deletedAt: undefined
        }
      ];

      render(
        <TrashView
          files={filesWithMissingDate}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.getByText(/Deleted on N\/A/)).toBeInTheDocument();
    });

    it('should handle string size values', () => {
      const filesWithStringSize = [
        {
          ...mockFiles[0],
          size: '2048' as any
        }
      ];

      render(
        <TrashView
          files={filesWithStringSize}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.getByText('2.0 MB')).toBeInTheDocument();
    });

    it('should handle invalid size values', () => {
      const filesWithInvalidSize = [
        {
          ...mockFiles[0],
          size: 'invalid' as any
        }
      ];

      render(
        <TrashView
          files={filesWithInvalidSize}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.getByText('0 KB')).toBeInTheDocument();
    });

    it('should handle null size values', () => {
      const filesWithNullSize = [
        {
          ...mockFiles[0],
          size: null as any
        }
      ];

      render(
        <TrashView
          files={filesWithNullSize}
          onRestore={mockOnRestore}
          onDeletePermanently={mockOnDeletePermanently}
          onEmptyTrash={mockOnEmptyTrash}
        />
      );

      expect(screen.getByText('0 KB')).toBeInTheDocument();
    });
  });
});