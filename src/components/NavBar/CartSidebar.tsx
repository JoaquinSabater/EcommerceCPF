'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth >= 768 // solo en escritorio
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 right-0 z-50 h-full w-80 max-w-full bg-white text-black shadow-lg transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold">Mi carrito</h2>
        <button onClick={onClose} className="p-2 border rounded text-black bg-white">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Image src="/cart.svg" width={48} height={48} alt="Empty cart" />
        <p className="text-xl font-semibold text-center">Tu carrito está vacío</p>
      </div>
    </div>
  );
}
