"use client";
import { LikeIcon } from '../../Icons';
import { useWishlist } from '../../context/WishlistContext';
import { extractBookPrice, formatPrice } from '../../utils/priceUtils';

export default function ProductCard({ product, onClick, showWishlist = true }) {
  // Normalize field names based on actual API structure
  const image = product?.cover_image || product?.image || product?.coverImage || product?.cover || '';
  const title = product?.title || product?.name || '';
  const category = product?.category?.name || product?.category || product?.categoryName || '';
  const genre = product?.genre?.name || product?.genre || product?.genreName || '';
  const _id = product?._id || product?.id || '';
  
  // Extract price using utility function
  const price = extractBookPrice(product);
  const originalPrice = product?.originalPrice || product?.originalCost || product?.listPrice || null;
  
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isInWishlist = wishlist.some(b => (b._id || b.id) === _id);

  const handleClick = (e) => {
    // Jangan trigger jika klik pada wishlist button
    if (e.target.closest('.wishlist-btn')) return;
    if (onClick) {
      onClick(product);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(_id || product?.id);
    } else {
      addToWishlist(product);
    }
  };

  // Get category/genre as string
  const getCategory = () => {
    if (category) {
      if (typeof category === 'string') return category;
      if (typeof category === 'object' && category.name) return category.name;
    }
    if (genre) {
      if (typeof genre === 'string') return genre;
      if (typeof genre === 'object' && genre.name) return genre.name;
    }
    return 'Uncategorized';
  };

  const displayPrice = formatPrice(price);
  const displayOriginalPrice = originalPrice ? formatPrice(originalPrice) : null;

  return (
    <div 
      onClick={handleClick}
      className="w-[275px] relative overflow-hidden flex flex-col rounded-lg cursor-pointer hover:shadow-lg transition-shadow shadow-sm h-full"
    >
      <div className="flex items-center justify-center bg-nt-3 w-full h-[280px] relative">
        {image ? (
          <img
            src={image}
            alt={title || 'Book cover'}
            className="max-w-[210px] max-h-full object-cover shadow-xl"
            onError={(e) => {
              e.target.src = '/bookcoverDefault.png';
            }}
          />
        ) : null}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            className="wishlist-btn absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-nt-1 transition-colors z-10"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {/* <LikeIcon 
              className="w-5 h-5"
              color="#23A6F0"
              filled={isInWishlist}
            /> */}
          </button>
        )}
      </div>
      <div className="flex flex-col flex-1 p-4">
        <p className="text-[#252B42] font-semibold text-base line-clamp-2 mb-1">
          {typeof title === 'string' ? title : title?.toString() || 'Untitled'}
        </p>
        <p className="text-[#737373] text-sm mb-2">{getCategory()}</p>
        <div className="flex items-center gap-2 mt-auto">
          {displayOriginalPrice && displayOriginalPrice !== displayPrice && (
            <p className="text-[#23856D] text-sm line-through">Rp {displayOriginalPrice}</p>
          )}
          <p className="text-[#23856D] font-bold text-lg">Rp {displayPrice}</p>
        </div>
      </div>
    </div>
  );
}
