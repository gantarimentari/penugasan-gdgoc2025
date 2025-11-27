"use client";
import { useState, useEffect } from 'react';
import { getRandomBook } from '../Service/api/bookService';
import BookDetailLayout from '../layout/BookDetailLayout';
import { extractBookPrice } from '../utils/priceUtils';

export default function FeaturedBook() {
  const [featuredBook, setFeaturedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBook();
  }, []);

  const fetchFeaturedBook = async () => {
    try {
      setLoading(true);
      const response = await getRandomBook();
      
      // Handle null response (network error)
      if (!response) {
        console.warn('Failed to fetch featured book. Retrying...');
        // Retry once after 2 seconds
        setTimeout(() => {
          fetchFeaturedBook();
        }, 2000);
        return;
      }
      
      let book = null;
      
      // Handle different response structures
      if (response) {
        if (response.data) {
          book = response.data;
        } else if (response.book) {
          book = response.book;
        } else if (response._id || response.id) {
          book = response;
        }
      }

      if (book) {
        // Normalize price using utility function
        book.price = extractBookPrice(book);
        
        // Keep category as object (has .name property)
        // We'll extract it in the render
        
        setFeaturedBook(book);
      }
    } catch (err) {
      console.error('Error fetching featured book:', err);
      // Don't set loading to false on error, let it retry
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pr-5"></div>
      </div>
    );
  }

  if (!featuredBook) {
    return null;
  }
  return <BookDetailLayout book={featuredBook} />;
}

