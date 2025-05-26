import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

type QuantityButtonProps = {
  onAdd: () => void;
  onRemove: () => void;
  children: React.ReactNode;
};

export default function QuantityButton({ onAdd, onRemove, children }: QuantityButtonProps) {
  return (
    <div className="flex items-center gap-1">
      <button className="p-1" onClick={onRemove}>
        <MinusIcon className="h-4 w-4" />
      </button>
      <span>{children}</span>
      <button className="p-1" onClick={onAdd}>
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}