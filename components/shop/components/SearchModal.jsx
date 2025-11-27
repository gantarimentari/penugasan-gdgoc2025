"use client";
import { useState, useEffect, useRef } from 'react';
import { searchBooksWithFilter } from '../../Service/api/bookService';
import ProductCard from './ProductCard';
import { extractBookPrice } from '../../utils/priceUtils';

export default function SearchModal({ isOpen, onClose, onBookClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);


  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const results = await searchBooksWithFilter({ keyword: searchQuery.trim() });
      
      // Handle different response structures
      let books = [];
      if (Array.isArray(results)) {
        books = results;
      } else if (results && results.books && Array.isArray(results.books)) {
        books = results.books;
      } else if (results && results.data) {
        if (Array.isArray(results.data)) {
          books = results.data;
        } else if (results.data.books && Array.isArray(results.data.books)) {
          books = results.data.books;
        }
      }

      // Clean up book data
      books = books
        .filter(Boolean)
        .filter(book => book && typeof book === 'object' && !Array.isArray(book))
        .map(book => {
          const cleanedBook = { ...book };
          if (cleanedBook.category && typeof cleanedBook.category === 'object') {
            cleanedBook.category = cleanedBook.category.name || '';
          }
          if (cleanedBook.genre && typeof cleanedBook.genre === 'object') {
            cleanedBook.genre = cleanedBook.genre.name || '';
          }
          // Normalize price using utility function
          cleanedBook.price = extractBookPrice(cleanedBook);
          return cleanedBook;
        });

      setSearchResults(books);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book) => {
    if (onBookClick) {
      onBookClick(book);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl mt-20 mb-10 rounded-lg shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-nt-2 p-4 rounded-t-lg z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#252B42]">Search Books</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-nt-2 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="flex-1 px-4 py-3 border border-nt-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pr-5 text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-pr-5 text-white rounded-lg font-semibold hover:bg-pr-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pr-5 mx-auto"></div>
                <p className="mt-4 text-nt-5">Searching books...</p>
              </div>
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {searchResults.map((book) => (
                  <ProductCard
                    key={book._id || book.id || Math.random()}
                    product={book}
                    onClick={handleBookClick}
                    showWishlist={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-nt-5 text-lg">No books found for "{searchQuery}"</p>
                <p className="text-nt-4 text-sm mt-2">Try different keywords</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-nt-5">Enter a keyword to search for books</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

