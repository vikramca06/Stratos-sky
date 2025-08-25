import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal';
import { FileItem } from '../../../types';

describe('DeleteConfirmationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnMoveToTrash = vi.fn();
  const mockOnDeletePermanently = vi.fn();
  
  const testFile: FileItem = {
    id: '1',
    name: 'test-file.pdf',
    type: 'document',
    size: 1024,
    lastModified: '2024-01-01T00:00:00Z',
    parentId: null,
    ownerEmail: 'test@example.com',
    sharedWith: [],
    tags: []
  };

  const testFolder: FileItem = {
    id: '2',
    name: 'test-folder',
    type: 'folder',
    size: 0,
    lastModified: '2024-01-01T00:00:00Z',
    parentId: null,
    ownerEmail: 'test@example.com',
    sharedWith: [],
    tags: []
  };
  
  const defaultProps = {
    items: [testFile],
    onClose: mockOnClose,
    onMoveToTrash: mockOnMoveToTrash,
    onDeletePermanently: mockOnDeletePermanently,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal with single item', () => {
      render(<DeleteConfirmationModal {...defaultProps} />);
      expect(screen.getByText(/Delete 1 item/)).toBeInTheDocument();
      expect(screen.getByText(/test-file.pdf/)).toBeInTheDocument();
    });

    it('should render modal with multiple items', () => {
      render(<DeleteConfirmationModal {...defaultProps} items={[testFile, testFolder]} />);
      expect(screen.getByText(/Delete 2 items/)).toBeInTheDocument();
      expect(screen.getByText(/test-file.pdf, test-folder/)).toBeInTheDocument();
    });

    it('should show trash option by default', () => {
      render(<DeleteConfirmationModal {...defaultProps} />);
      const trashRadio = screen.getByLabelText(/Move to trash/);
      expect(trashRadio).toBeChecked();
    });

    it('should show permanent delete option', () => {
      render(<DeleteConfirmationModal {...defaultProps} />);
      const permanentRadio = screen.getByLabelText(/Delete permanently/);
      expect(permanentRadio).toBeInTheDocument();
      expect(permanentRadio).not.toBeChecked();
    });
  });

  describe('Interactions', () => {
    it('should switch between trash and permanent delete options', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmationModal {...defaultProps} />);
      
      const permanentRadio = screen.getByLabelText(/Delete permanently/);
      await user.click(permanentRadio);
      
      expect(permanentRadio).toBeChecked();
      expect(screen.getByLabelText(/Move to trash/)).not.toBeChecked();
    });

    it('should show confirmation checkbox when permanent delete is selected', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmationModal {...defaultProps} />);
      
      const permanentRadio = screen.getByLabelText(/Delete permanently/);
      await user.click(permanentRadio);
      
      expect(screen.getByLabelText(/I understand this action cannot be undone/)).toBeInTheDocument();
    });

    it('should require confirmation for permanent delete', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmationModal {...defaultProps} />);
      
      // Select permanent delete
      await user.click(screen.getByLabelText(/Delete permanently/));
      
      // Button shows "Delete Permanently" but works without the checkbox first
      const deleteButton = screen.getByRole('button', { name: /Delete Permanently/ });
      
      // Click button first time - should show confirmation
      await user.click(deleteButton);
      
      // Now checkbox should be visible
      const checkbox = screen.getByLabelText(/I understand this action cannot be undone/);
      expect(checkbox).toBeInTheDocument();
    });

    it('should call onMoveToTrash when trash option is selected', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmationModal {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /Move to Trash/ });
      await user.click(deleteButton);
      
      expect(mockOnMoveToTrash).toHaveBeenCalled();
      expect(mockOnDeletePermanently).not.toHaveBeenCalled();
    });

    it('should call onDeletePermanently when permanent option is selected', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmationModal {...defaultProps} />);
      
      // Select permanent delete and confirm
      await user.click(screen.getByLabelText(/Delete permanently/));
      await user.click(screen.getByLabelText(/I understand this action cannot be undone/));
      
      const deleteButton = screen.getByRole('button', { name: /Delete/ });
      await user.click(deleteButton);
      
      expect(mockOnDeletePermanently).toHaveBeenCalled();
      expect(mockOnMoveToTrash).not.toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmationModal {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /Cancel/ }));
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside modal', async () => {
      const user = userEvent.setup();
      render(<DeleteConfirmationModal {...defaultProps} />);
      
      // Click on the backdrop (outside the modal)
      const backdrop = screen.getByTestId('modal-backdrop');
      await user.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      render(<DeleteConfirmationModal {...defaultProps} items={[]} />);
      expect(screen.getByText(/Delete 0 items/)).toBeInTheDocument();
    });

    it('should reset state when items change', () => {
      const { rerender } = render(<DeleteConfirmationModal {...defaultProps} />);
      
      // Select permanent delete
      const permanentRadio = screen.getByLabelText(/Delete permanently/);
      fireEvent.click(permanentRadio);
      expect(permanentRadio).toBeChecked();
      
      // Change items
      rerender(<DeleteConfirmationModal {...defaultProps} items={[testFolder]} />);
      
      // Should reset to trash option
      expect(screen.getByLabelText(/Move to trash/)).toBeChecked();
      expect(screen.getByLabelText(/Delete permanently/)).not.toBeChecked();
    });

    it('should handle items with special characters in names', () => {
      const specialFile: FileItem = {
        ...testFile,
        name: 'file with & special < characters > "quotes".pdf'
      };
      
      render(<DeleteConfirmationModal {...defaultProps} items={[specialFile]} />);
      expect(screen.getByText(/Delete file with & special < characters > "quotes".pdf/)).toBeInTheDocument();
    });
  });
});