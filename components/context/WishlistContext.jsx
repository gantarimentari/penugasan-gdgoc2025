"use client";
import { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const addToWishlist = (book) => {
    setWishlist(prev => {
      // Check if book already exists
      const exists = prev.find(b => (b._id || b.id) === (book._id || book.id));
      if (exists) return prev;
      return [...prev, book];
    });
  };

  const removeFromWishlist = (bookId) => {
    setWishlist(prev => prev.filter(b => (b._id || b.id) !== bookId));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};





