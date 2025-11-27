"use client";
import { useState } from 'react';
import { ActionLikeIcon, CloseIcon, LeftArrowIcon, RightArrowIcon  } from '../Icons';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { extractBookPrice, formatPrice as formatPriceUtil } from '../utils/priceUtils';

export default function BookDetailLayout({ book = null, onClick }) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  if (!book) return null;

  const isInWishlist = wishlist.some(b => (b._id || b.id) === (book._id || book.id));

  const handleAddToCart = () => {
    addToCart(book);
  };

  const handleWishlistClick = () => {
    if (isInWishlist) {
      removeFromWishlist(book._id || book.id);
    } else {
      addToWishlist(book);
    }
  };

  // Extract price using utility function
  const price = extractBookPrice(book);

  const categories = [];
  if (book.category) {
    const catName = typeof book.category === 'string' ? book.category : book.category.name;
    if (catName) categories.push(catName);
  }
  if (book.genre) {
    const genreName = typeof book.genre === 'string' ? book.genre : book.genre.name;
    if (genreName && genreName !== categories[0]) {
      categories.push(genreName);
    }
  }

  const image = book.cover_image || book.image || '';
  const [isOpen, setIsOpen]= useState(false);

  const handleReadMore = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="w-full flex justify-center bg-white pb-20 ">
      <div className="w-full max-w-7xl px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center relative">
          {/* Close Button */}
          

          {/* Book Cover */}
          <div className="flex flex-1 relative">
            {onClick && (
              <button
                onClick={() => onClick('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Previous book"
              >
                <LeftArrowIcon 
                  className="w-8 h-8" 
                  color="#23A6F0" 
                />
              </button>
            )}
              
            <div className="w-full h-[500px] p-10 bg-nt-3  flex justify-center shadow-xl">
              {image ? (
                <img
                  src={image}
                  alt={book.title || 'Book cover'}
                  className="max-w-full max-h-[450px] object-contain "
                  onError={(e) => {
                    e.target.src = '/bookcoverDefault.png';
                  }}
                />
              ) : null}
            </div>
            
            {onClick && (
              <button
                onClick={() => onClick('next')}
                className="absolute top-1/2 right-4 -translate-y-1/2 z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Next book"
              >
                <RightArrowIcon 
                  className="w-8 h-8" 
                  color="#23A6F0" 
                />
              </button>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-nt-2 text-nt-7 rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-[#252B42]">
              {book.title || 'Untitled'}
            </h1>

            {/* Price */}
            <p className="text-3xl font-bold text-[#252B42]">
              Rp {formatPriceUtil(price)}
            </p>

            {/* Availability */}
            <p className="text-[#737373] font-semibold">Availability: <span className='text-[#23A6F0]'>In Stock</span></p>

            {/* Description */}
            <p className="text-nt-6 text-base leading-relaxed line-clamp-3">
              { book.description || book.summary || 'No description available.'}
            </p>
            <button
            onClick={handleReadMore}
            className='hover:text-pr-5 font-semibold flex justify-end'>
              Read More
            </button>
            {
              isOpen && (
                <div 
                  className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
                  onClick={handleClose}
                >
                  <div 
                    className="bg-white w-full max-w-2xl  rounded-lg shadow-2xl overflow-hidden "
                    onClick={(e) => e.stopPropagation()}
                  >
                    
                    <div className="flex items-center justify-between p-6 pb-2 relative">
                      <h2 className="text-2xl font-bold text-[#252B42]">Description</h2>
                      <button
                        onClick={handleClose}
                        className="p-2 hover:bg-nt-2 rounded-full transition-colors"
                        aria-label="Close"
                      >
                       <CloseIcon/>
                      </button>
                    </div>
                    
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                      <p className="text-nt-6 text-base leading-relaxed">
                        { book.description || book.summary || 'No description available.'}
                      </p>
                    </div>
                    
                  </div>
                </div>
              )
            }
            

            {/* Book Details */}
            <div className="flex flex-col gap-2 text-sm text-nt-6">
            
              
              {book.details?.total_pages && book.details.total_pages !== '0' && (
                <p><span className="font-semibold">Pages:</span> {book.details.total_pages}</p>
              )}
              {book.publisher && (
                <p><span className="font-semibold">Publisher:</span> {book.publisher}</p>
              )}
              {book.details?.isbn && book.details.isbn !== '0' && (
                <p><span className="font-semibold">ISBN:</span> {book.details.isbn}</p>
              )}
              {book.details?.published_date && (
                <p><span className="font-semibold">Published:</span> {book.details.published_date}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
              <button className="px-6 py-3 bg-pr-5 text-white rounded-lg font-semibold hover:bg-pr-6 transition-colors">
                Buy Now
              </button>
              <button
                onClick={handleWishlistClick}
                className="rounded-full p-3 bg-pr-0  hover:bg-nt-1 transition-colors"
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <ActionLikeIcon 
                  className="w-6 h-6"
                  
                  filled={isInWishlist}
                />
              </button>
              <button 
                onClick={handleAddToCart}
                className="p-3 bg-pr-0 rounded-full hover:bg-nt-1 transition-colors"
                aria-label="Add to cart"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button className="p-3 bg-pr-0 rounded-full hover:bg-nt-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


