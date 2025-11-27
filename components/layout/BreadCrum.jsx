"use client";
import Link from 'next/link';
import { ChevronRightIcon } from '../Icons';

export default function Breadcrumb({ items = [] }) {
  return (
    <div className="w-full flex justify-center  ">
      <div className="w-full max-w-7xl px-4 py-10">
        <nav className="flex items-center sm:justify-start justify-center gap-2 text-sm">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-[#252B42] font-bold  text-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#BDBDBD] text-sm font-bold">{item.label}</span>
              )}
              {index < items.length - 1 && (
                <ChevronRightIcon  />
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
