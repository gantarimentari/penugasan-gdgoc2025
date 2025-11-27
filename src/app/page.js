"use client";
import { useState, useEffect } from "react";
import TopBar from "../../components/layout/TopBar";
import Navbar from "../../components/layout/Navbar";
import Breadcrumb from "../../components/layout/BreadCrum";
import FeaturedBook from "../../components/shop/FeaturedBook";
import BookRecommendation from "../../components/shop/BookRecomendation";
import BookDetail from "../../components/shop/BookDetail";
import SearchModal from "../../components/shop/components/SearchModal";
import { WishlistProvider } from "../../components/context/WishlistContext";
import { CartProvider } from "../../components/context/CartContext";
import { getBookDetail } from "../../components/Service/api/bookService";

export default function Home() {
  // State Management
  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentBookList, setCurrentBookList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handlers
  const handleBookClick = async (book, index = null, sourceList = null) => {
    if (sourceList && Array.isArray(sourceList)) {
      setCurrentBookList(sourceList);
      setCurrentIndex(index);
    } else {
      setCurrentBookList([]);
      setCurrentIndex(null);
    }

    try {
      setLoadingDetail(true);
      const bookId = book._id || book.id;
      const detailData = await getBookDetail(bookId);
      setSelectedBook(detailData);
    } catch (error) {
      console.error('Error fetching book detail:', error);
      setSelectedBook(book);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDetailNavigate = (direction) => {
    if (!currentBookList.length || currentIndex === null) return;

    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= currentBookList.length) return;

    const nextBook = currentBookList[newIndex];
    if (!nextBook) return;

    setSelectedBook(nextBook);
    setCurrentIndex(newIndex);
  };

  const handleScrollToReadingList = () => {
    setTimeout(() => {
      const element = document.getElementById('reading-list-section');
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - 120;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  // Effects
  useEffect(() => {
    if (selectedBook) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedBook]);

  return (
    <WishlistProvider>
      <CartProvider>
        <div className="flex flex-col w-full bg-white font-sans">
          <main className="flex w-full flex-col flex-grow relative bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white sticky-header">
              <TopBar />
              <Navbar 
                onBookClick={handleBookClick} 
                onScrollToReadingList={handleScrollToReadingList}
                onSearchClick={handleSearchClick}
              />
            </header>
            
            {/* Search Modal - Outside header */}
            <SearchModal 
              isOpen={isSearchOpen} 
              onClose={handleCloseSearch}
              onBookClick={handleBookClick}
            />
            
            {/* Breadcrumb */}
            <Breadcrumb items={[
              { label: 'Home', href: '/' },
              { label: 'Shop' }
            ]} />
            
            {/* Hero Section - Featured Book or Book Detail */}
            {loadingDetail ? (
              <div className="w-full flex justify-center py-12 border-b border-nt-2">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pr-5 mx-auto"></div>
                  <p className="mt-4 text-nt-5">Loading book details...</p>
                </div>
              </div>
            ) : selectedBook ? (
              <BookDetail 
                book={selectedBook} 
                onNavigate={handleDetailNavigate}
              />
            ) : (
              <FeaturedBook />
            )}
            
            {/* Reading List Section */}
            <BookRecommendation 
              title="Your Reading List" 
              isWishlist={true}
              limit={4}
              onBookClick={handleBookClick}
            />
            
            {/* Books For You Section */}
            <BookRecommendation 
              title="Books For You" 
              isRandom={false}
              limit={8}
              onBookClick={handleBookClick}
              showWishlist={false}
              keepStatic={true}
            />
          </main>
        </div>
      </CartProvider>
    </WishlistProvider>
  );
}
