"use client";
import { createContext, useContext, useState } from 'react';
import { extractBookPrice } from '../utils/priceUtils';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Cart items: [{ book, quantity, selected }, ...]
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (book) => {
    setCartItems(prev => {
      // Check if book already exists
      const existingIndex = prev.findIndex(item => (item.book._id || item.book.id) === (book._id || book.id));
      
      if (existingIndex >= 0) {
        // If exists, increase quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      
      // If not exists, add new item
      return [...prev, { book, quantity: 1, selected: true }];
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems(prev => prev.filter(item => (item.book._id || item.book.id) !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        (item.book._id || item.book.id) === bookId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const toggleSelect = (bookId) => {
    setCartItems(prev =>
      prev.map(item =>
        (item.book._id || item.book.id) === bookId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(prev =>
      prev.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => item.selected);
  };

  const getTotalPrice = () => {
    return getSelectedItems().reduce((sum, item) => {
      const price = extractBookPrice(item.book);
      return sum + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleSelect,
      toggleSelectAll,
      getTotalItems,
      getSelectedItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

