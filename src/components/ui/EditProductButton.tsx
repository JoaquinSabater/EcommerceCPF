"use client";

import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import EditProductModal from '@/components/Products/EditProductModal';
import { useRouter } from 'next/navigation';

interface EditProductButtonProps {
  producto: any;
}

export default function EditProductButton({ producto }: EditProductButtonProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const { isAdmin } = useAuth();
  const router = useRouter();

  if (!isAdmin) return null;

  return (
    <>
      <button
        onClick={() => setShowEditModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
      >
        <PencilIcon className="w-4 h-4" />
        <span>Editar</span>
      </button>

      {showEditModal && (
        <EditProductModal
          producto={producto}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedProduct) => {
            setShowEditModal(false);
            // Recargar la página para mostrar los cambios
            router.refresh();
          }}
        />
      )}
    </>
  );
}