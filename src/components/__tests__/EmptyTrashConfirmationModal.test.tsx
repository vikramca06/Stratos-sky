import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyTrashConfirmationModal from '../../../components/EmptyTrashConfirmationModal';

describe('EmptyTrashConfirmationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display correct item count', () => {
    render(
      <EmptyTrashConfirmationModal
        itemCount={5}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/all 5 items/)).toBeInTheDocument();
  });

  it('should display singular item text', () => {
    render(
      <EmptyTrashConfirmationModal
        itemCount={1}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/all 1 item[^s]/)).toBeInTheDocument();
  });

  it('should display warning message', () => {
    render(
      <EmptyTrashConfirmationModal
        itemCount={3}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/This action cannot be undone!/)).toBeInTheDocument();
    expect(screen.getByText(/permanently deleted and cannot be recovered/)).toBeInTheDocument();
  });

  it('should call onConfirm and onClose when Empty Trash is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EmptyTrashConfirmationModal
        itemCount={3}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: /Empty Trash/ }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <EmptyTrashConfirmationModal
        itemCount={3}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: /Cancel/ }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should close when clicking outside modal', async () => {
    const user = userEvent.setup();
    
    const { container } = render(
      <EmptyTrashConfirmationModal
        itemCount={3}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // Click on the backdrop
    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) {
      await user.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});