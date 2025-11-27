"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../context/CartContext';
import { extractBookPrice, formatPrice } from '../../utils/priceUtils';

export default function CartModal({ isOpen, onClose }) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    toggleSelect,
    toggleSelectAll,
    getSelectedItems,
    getTotalPrice
  } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const selected = getSelectedItems();
    setSelectedItems(selected);
    setTotalPrice(getTotalPrice());
  }, [cartItems]);

  const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center overflow-y-auto p-2 sm:p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      style={{ zIndex: 10000 }}
    >
      <div 
        className={`bg-white w-full max-w-4xl my-auto rounded-lg shadow-2xl relative transition-all duration-300 ease-out transform-gpu max-h-[90vh] flex flex-col ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-nt-2 p-4 sm:p-6 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-[#252B42]">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-nt-2 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-4 sm:gap-6 overflow-y-auto flex-1">
          {/* Left: Cart Items */}
          <div className="flex-1 order-1 lg:order-1">
            {/* Select All */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 pb-4 border-b border-nt-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 sm:w-5 sm:h-5 text-pr-5 rounded cursor-pointer"
              />
              <label className="text-sm sm:text-base text-[#252B42] font-semibold cursor-pointer">
                All Products
              </label>
            </div>

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-nt-5 text-base sm:text-lg">Your cart is empty</p>
                <p className="text-nt-4 text-xs sm:text-sm mt-2">Add some books to get started!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => {
                  const book = item.book;
                  const bookId = book._id || book.id;
                  const image = book.cover_image || book.image || '';
                  const title = book.title || 'Untitled';
                  const price = extractBookPrice(book);
                  
                  return (
                    <div key={bookId} className="flex gap-2 sm:gap-4 items-start pb-3 sm:pb-4 border-b border-nt-2">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelect(bookId)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-pr-5 rounded cursor-pointer mt-1 sm:mt-2 flex-shrink-0"
                      />

                      {/* Book Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-nt-3 flex items-center justify-center flex-shrink-0">
                        {image ? (
                          <img
                            src={image}
                            alt={title}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.src = '/bookcoverDefault.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-nt-2"></div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#252B42] mb-1 line-clamp-2">
                          {title}
                        </h3>
                        <p className="text-xs sm:text-sm text-nt-5 mb-2 truncate">
                          {bookId}
                        </p>

                        {/* Quantity & Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(bookId, item.quantity - 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-nt-2 rounded hover:bg-nt-2 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <span className="text-base sm:text-lg">-</span>
                            </button>
                            <span className="w-10 sm:w-12 text-center text-sm sm:text-base font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(bookId, item.quantity + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-nt-2 rounded hover:bg-nt-2 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <span className="text-base sm:text-lg">+</span>
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-left sm:text-right">
                            <p className="text-base sm:text-lg font-bold text-[#252B42]">
                              Rp {formatPrice(price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeFromCart(bookId)}
                        className="p-1.5 sm:p-2 hover:bg-nt-2 rounded transition-colors mt-1 sm:mt-2 flex-shrink-0"
                        aria-label="Remove from cart"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-nt-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-2">
            <div className="bg-nt-2 p-4 sm:p-6 rounded-lg lg:sticky lg:top-24">
              <h3 className="text-lg sm:text-xl font-bold text-[#252B42] mb-3 sm:mb-4">
                Order Summary ({selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items)
              </h3>
              
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex justify-between text-sm sm:text-base text-nt-6">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rp {formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-nt-6">
                  <span>Discount</span>
                  <span className="font-semibold">-Rp 0</span>
                </div>
              </div>

              <div className="border-t border-nt-2 pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-bold text-[#252B42]">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-[#252B42]">Rp {formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                disabled={selectedItems.length === 0}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-pr-5 text-white rounded-lg font-semibold hover:bg-pr-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  // Use portal to render modal at root level, above header
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

