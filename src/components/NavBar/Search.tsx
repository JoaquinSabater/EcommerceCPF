'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Search() {
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Buscar:', search);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-[300px]"
    >
      <input
        type="text"
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-2 text-gray-500 hover:text-white hover:bg-orange-600 rounded-full p-1 transition-colors duration-200"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

export function SearchSkeleton() {
  return (
    <div className="w-full max-w-[300px] h-10 bg-gray-200 animate-pulse rounded-lg" />
  );
}
