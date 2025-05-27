export default function PurchaseModal({
  items,
  open,
  onClose,
}: {
  items: any[];
  open: boolean;
  onClose: () => void;
}) {
  const handleInnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-[95vw] max-w-2xl p-4 sm:p-8 md:p-12 lg:p-16"
        onClick={handleInnerClick}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Resumen de tu compra</h2>
        <ul className="mb-8 md:mb-10">
          {items.length === 0 ? (
            <li>No hay productos en el carrito.</li>
          ) : (
            items.map((item) => (
              <li key={item.codigo_interno} className="mb-3 md:mb-4 text-base md:text-lg">
                <strong>{item.modelo}</strong> ({item.item_nombre}) x {item.cantidad}
              </li>
            ))
          )}
        </ul>
        <div className="flex gap-4 md:gap-6">
          <button
            className="bg-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded text-base md:text-lg hover:bg-orange-700"
            onClick={onClose}
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}