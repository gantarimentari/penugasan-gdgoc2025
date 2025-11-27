"use client";
import { useState } from "react";
import { AccountIcon, SearchIcon, CartIcon, LikeIcon, ChevronDownIcon } from "../Icons";
import Link from 'next/link';
import SearchModal from "../shop/components/SearchModal";
import CartModal from "../shop/components/CartModal";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Navbar({ onBookClick, onScrollToReadingList }) {
  const { wishlist } = useWishlist();
  const { getTotalItems } = useCart();

  const [navData, setNavData] = useState({
    brandName: "Bookstar",
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const toggleShopDropdown = () => {
    setIsShopDropdownOpen(!isShopDropdownOpen);
  };

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onScrollToReadingList) {
      onScrollToReadingList();
    }
  };

  const navItems=[
    {href: '#home', label: 'Home'},
    {href: '/', label: 'Shop', hasDropdown: true},
    {href: '#about', label: 'About'},
    {href: '#blog', label: 'Blog'},
    {href: '#contact', label: 'Contact'},
    {href: '#pages', label: 'Pages'},
  ]
  const navIcons = [
    
    {icon: SearchIcon, label: 'Search'},
    {icon: CartIcon, label: 'Cart'},
    {icon: LikeIcon, label: 'Like'},
  ]
  return (
    <nav className="w-full flex justify-center bg-white" style={{ transform: 'translateZ(0)' }}>
      <div className="w-full max-w-7xl">
        <div className="flex h-15 items-center justify-between px-4 py-8">
          <div className="pr-6">
            <p className="text-2xl text-[#252B42] font-semibold">{navData.brandName}</p>
          </div>
          <div className="hidden lg:flex gap-6">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleShopDropdown}
                  className={`flex items-center gap-1 font-semibold transition-colors font-medium ${
                    isShopDropdownOpen 
                      ? 'text-[#252B42]' 
                      : 'text-[#737373] hover:text-[#252B42]'
                  }`}
                >
                  {item.label}
                  {isShopDropdownOpen && (
                    <ChevronDownIcon 
                      className="w-4 h-4 transition-transform duration-200"
                      color="#252B42"
                    />
                  )}
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[#737373] font-semibold hover:text-[#252B42] transition-colors font-medium"
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
          <div className="hidden lg:flex gap-8">
            <div className="flex items-center gap-2">
              <AccountIcon className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors"/>
              <a className="text-[#23A6F0] text-base font-semibold">Login / <span>Register</span></a>
            </div>  
            <div className="flex gap-8">
              {navIcons.map(({icon: IconComponent, label}, index) => (
                <div key={index} className="flex items-center">
                  {label === 'Search' ? (
                    <button
                      onClick={handleSearchClick}
                      className="p-1 hover:bg-nt-2 rounded transition-colors"
                      aria-label="Search"
                    >
                      <IconComponent className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors"/>
                    </button>
                  ) : label === 'Cart' ? (
                    <button
                      onClick={handleCartClick}
                      className="flex gap-2 items-center p-1 hover:bg-nt-2 rounded transition-colors relative"
                      aria-label="Shopping Cart"
                    >
                      <IconComponent className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors"/>
                      {getTotalItems() > 0 && (
                        <span className="text-[#23A6F0] flex items-center justify-center text-xs font-bold">
                          {getTotalItems()}
                        </span>
                      )}
                    </button>
                  ) : label === 'Like' ? (
                    <button
                      onClick={handleLikeClick}
                      className="flex gap-2 items-center p-1 hover:bg-nt-2 rounded transition-colors"
                      aria-label="Go to Reading List"
                    >
                      <IconComponent className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors"/>
                      {wishlist.length > 0 && (
                        <span className="text-[#23A6F0] flex items-center justify-center text-xs font-bold">
                          {wishlist.length}
                        </span>
                      )}
                    </button>
                  ) : (
                    <IconComponent className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors"/>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* burger */}
          <button 
            onClick={toggleMenu}
            className="lg:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
            aria-label="Toggle menu">
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ml-auto ${isMenuOpen ? 'w-6' : 'w-6'}`}></span>
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ml-auto ${isMenuOpen ? 'w-4' : 'w-6'}`}></span>
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ml-auto ${isMenuOpen ? 'w-2' : 'w-6'}`}></span>
          </button>
        </div>
        {/* isian  */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? ' opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={closeMenu}
                className="w-full text-center text-[#737373] hover:text-[#252B42] transition-colors font-medium py-2"
              >
                {item.label}
              </button>

            ))}
            <div className="flex justify-center items-center gap-2">
              <AccountIcon className="w-5 h-5 cursor-pointer transition-colors"/>
              <a className="text-[#23A6F0] text-base font-semibold">Login / <span>Register</span></a>
            </div>
            {navIcons.map(({icon: IconComponent, label}, index) => (
              <div key={index} className="flex justify-center items-center">
                {label === 'Search' ? (
                  <button
                    onClick={handleSearchClick}
                    className="p-1 hover:bg-nt-2 rounded "
                    aria-label="Search"
                  >
                    <IconComponent className="w-5 h-5 cursor-pointer  "/>
                  </button>
                ) : label === 'Cart' ? (
                  <button
                    onClick={(e) => {
                      closeMenu();
                      handleCartClick(e);
                    }}
                    className="flex gap-2 items-center p-1 hover:bg-nt-2 rounded transition-colors"
                    aria-label="Shopping Cart"
                  >
                    <IconComponent className="w-5 h-5 cursor-pointer"/>
                    {getTotalItems() > 0 && (
                      <span className="flex items-center text-[#23A6F0] justify-center text-xs font-bold">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                ) : label === 'Like' ? (
                  <button
                    onClick={(e) => {
                      closeMenu();
                      handleLikeClick(e);
                    }}
                    className="flex gap-2 items-center p-1 hover:bg-nt-2 rounded transition-colors"
                    aria-label="Go to Reading List"
                  >
                    <IconComponent className="w-5 h-5 cursor-pointer"/>
                    {wishlist.length > 0 && (
                      <span className="flex items-center text-[#23A6F0] justify-center text-xs font-bold">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                ) : (
                  <IconComponent className="w-5 h-5 cursor-pointer  "/>
                )}
              </div>
            ))}
            
            
          </div>
        </div>
      </div>
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={handleCloseSearch}
        onBookClick={onBookClick}
      />
      
      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartOpen} 
        onClose={handleCloseCart}
      />
    </nav>  
    
  );
};