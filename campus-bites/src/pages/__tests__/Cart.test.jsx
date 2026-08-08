import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Cart from '../Cart';

vi.mock('../../context/CartContext', () => ({
  useCart: vi.fn(() => ({
    cartItems: [
      { id: '1', name: 'Vada Pav', price: 30, quantity: 2, image_url: '', is_veg: true },
    ],
    updateQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    cartTotal: 60,
    clearCart: vi.fn(),
  })),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { name: 'Test', role: 'student' }, token: 'fake-token' })),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('Cart', () => {
  it('renders cart items', () => {
    render(<Cart />);
    expect(screen.getByText('Vada Pav')).toBeInTheDocument();
  });

  it('shows empty cart message when no items', async () => {
    const { useCart } = await import('../../context/CartContext');
    useCart.mockReturnValueOnce({
      cartItems: [],
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      cartTotal: 0,
      clearCart: vi.fn(),
    });
    render(<Cart />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });
});
