"use client";
import BookDetailLayout from '../layout/BookDetailLayout';

export default function BookDetail({ book, onNavigate }) {
  if (!book) return null;

  const handleClick = (direction) => {
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  return <BookDetailLayout book={book} onClick={handleClick} />;
}
