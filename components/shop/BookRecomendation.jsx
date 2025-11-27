"use client";
import React, { useState, useEffect } from 'react';
import { getBooksPerPage, getRandomBook, getAllBooksMultiPage } from '../Service/api/bookService';
import ProductCard from './components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { extractBookPrice } from '../utils/priceUtils';

export default function BookRecommendation({ 
  title = "Your Reading List", 
  isWishlist = false,
  isRandom = false,
  limit = 8,
  onBookClick,
  showWishlist = true,
  keepStatic = false
}) {
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // Store all fetched books
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { wishlist } = useWishlist();

  // Calculate items per page based on grid (2 rows)
  // lg: 4 cols x 2 rows = 8, md: 3 cols x 2 rows = 6, sm: 2 cols x 2 rows = 4, mobile: 1 col x 2 rows = 2
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 8; // SSR default
    if (window.innerWidth >= 1024) return 8; // lg: 4x2
    if (window.innerWidth >= 768) return 6; // md: 3x2
    if (window.innerWidth >= 640) return 4; // sm: 2x2
    return 2; // mobile: 1x2
  };

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return getItemsPerPage();
    }
    return 8; // SSR default
  });

  // Update items per page on window resize
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    if (isWishlist) {
      setBooks(wishlist);
      setAllBooks(wishlist);
      setLoading(false);
      setTotalPages(1);
    } else if (!keepStatic) {
      fetchBooks();
    }
  }, [isWishlist, wishlist, currentPage]);

  // Client-side pagination for Books For You (keepStatic)
  useEffect(() => {
    if (keepStatic && !isWishlist && allBooks.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedBooks = allBooks.slice(startIndex, endIndex);
      setBooks(paginatedBooks);
      setTotalPages(Math.ceil(allBooks.length / itemsPerPage));
    }
  }, [keepStatic, isWishlist, allBooks, currentPage, itemsPerPage]);

  // Fetch once untuk static books
  useEffect(() => {
    if (keepStatic && !isWishlist) {
      fetchBooks();
    }
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let booksData = [];
      
      if (isRandom) {
        // Fetch random books
        const randomPromises = Array.from({ length: limit }, () => getRandomBook());
        const randomResults = await Promise.all(randomPromises);
        
        const seenIds = new Set();
        randomResults.forEach(result => {
          let book = null;
          if (result && result.data) {
            book = result.data;
          } else if (result && (result._id || result.id)) {
            book = result;
          }
          
          if (book) {
            const bookId = book._id || book.id;
            if (!seenIds.has(bookId)) {
              seenIds.add(bookId);
              booksData.push(book);
            }
          }
        });
      } else {
        // For keepStatic (Books For You), fetch multiple pages at once for client-side pagination
        if (keepStatic) {
          // Fetch first 10 pages to have enough books for pagination
          booksData = await getAllBooksMultiPage(10);
        } else {
          // Fetch regular books per page (server-side pagination)
          const response = await getBooksPerPage(currentPage);
          
          // Handle different response structures
          if (Array.isArray(response)) {
            booksData = response;
          } else if (response && typeof response === 'object') {
            if (response.books && Array.isArray(response.books)) {
              booksData = response.books;
              if (response.totalPages) setTotalPages(response.totalPages);
              if (response.pagination && response.pagination.totalPages) setTotalPages(response.pagination.totalPages);
            } else if (response.data) {
              if (Array.isArray(response.data)) {
                booksData = response.data;
              } else if (response.data.books && Array.isArray(response.data.books)) {
                booksData = response.data.books;
                if (response.data.totalPages) setTotalPages(response.data.totalPages);
              }
            } else {
              booksData = [];
            }
          } else {
            booksData = [];
          }
        }
      }

      // Clean up book data and normalize field names
      booksData = booksData
        .filter(Boolean)
        .filter(book => book && typeof book === 'object' && !Array.isArray(book))
        .map(book => {
          const cleanedBook = { ...book };
          
          // Normalize image field - API uses cover_image
          if (!cleanedBook.cover_image && !cleanedBook.image) {
            cleanedBook.cover_image = cleanedBook.image || cleanedBook.coverImage || cleanedBook.cover || '';
          }
          
          // Normalize price using utility function
          cleanedBook.price = extractBookPrice(cleanedBook);
          
          // Keep category and genre as objects (they have .name property)
          // ProductCard will handle extracting .name
          
          return cleanedBook;
        });
      
      // For keepStatic (Books For You), store all books and paginate client-side
      if (keepStatic && !isWishlist) {
        setAllBooks(booksData);
        // Calculate initial pagination using current itemsPerPage
        const currentItemsPerPage = typeof window !== 'undefined' ? getItemsPerPage() : 8;
        const startIndex = 0;
        const endIndex = currentItemsPerPage;
        const paginatedBooks = booksData.slice(startIndex, endIndex);
        setBooks(paginatedBooks);
        setTotalPages(Math.ceil(booksData.length / currentItemsPerPage));
      } else {
        setBooks(booksData);
        setAllBooks(booksData);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product, index) => {
    if (!onBookClick) return;

    // Untuk Books For You & Your Reading List, kirim index & list buku agar bisa navigate
    // Exclude random karena susunannya tidak konsisten
    if (!isRandom) {
      onBookClick(product, index, books);
    } else {
      // Untuk random cukup kirim book saja (ga bisa navigate karena random)
      onBookClick(product);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pr-5 mx-auto"></div>
          <p className="mt-4 text-nt-5">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchBooks}
            className="mt-4 px-4 py-2 bg-pr-5 text-white rounded hover:bg-pr-6"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-8" id={isWishlist ? 'reading-list-section' : undefined}>
      <div className="w-full max-w-7xl px-4">
        
        {title && (
          <h2 className="text-2xl font-bold text-[#252B42] border-b border-nt-2 pb-6 mb-6">{title}</h2>
        )}
        
        {books.length === 0 && !loading ? (
          <div className="text-center py-12 ">
            <p className="text-nt-5">
              {isWishlist ? 'No books in your reading list. Click the heart icon on any book to add it here!' : 'No books found.'}
            </p>
          </div>
        ) : (
          <>
            {isWishlist ? (
              // Horizontal scrollable carousel for wishlist
              <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                  {books.map((book, index) => (
                    <div key={book._id || book.id || Math.random()} className="flex-shrink-0 w-64 snap-start">
                      <ProductCard
                        product={book}
                        onClick={() => handleProductClick(book, index)}
                        showWishlist={showWishlist && !isWishlist}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Grid layout for non-wishlist
              <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center`}>
                {books.map((book, index) => (
                  <ProductCard
                    key={book._id || book.id || Math.random()}
                    product={book}
                    onClick={() => handleProductClick(book, index)}
                    showWishlist={showWishlist && !isWishlist}
                  />
                ))}
              </div>
            )}
            
            {!isWishlist && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-nt-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nt-3 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 sm:gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2 sm:px-3 py-2 text-sm sm:text-base rounded transition-colors ${
                          currentPage === pageNum
                            ? 'bg-pr-5 text-white'
                            : 'bg-nt-2 hover:bg-nt-3'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-nt-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nt-3 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
