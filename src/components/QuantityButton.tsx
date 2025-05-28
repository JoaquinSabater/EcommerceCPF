import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

type QuantityButtonProps = {
  value: number;
  onAdd: () => void;
  onRemove: () => void;
  onSet: (value: number) => void;
  modelo: string;
};

export default function QuantityButton({
  value,
  onAdd,
  onRemove,
  onSet,
  modelo,
}: QuantityButtonProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>(String(value));

  useEffect(() => {
    if (!editing) setInputValue(String(value));
  }, [value, editing]);

  const handleInputBlur = () => {
    setEditing(false);
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      if (parsed !== value) onSet(parsed);
    } else {
      setInputValue(String(value)); // Restaura el valor anterior si el input es inválido
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Permite vacío o números positivos (incluido 0)
    if (val === "" || (/^\d+$/.test(val) && parseInt(val, 10) >= 0)) {
      setInputValue(val);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-xs font-medium text-gray-800 text-center leading-tight truncate w-full">{modelo}</span>
      <div className="flex items-center bg-gray-100 rounded-lg px-1 py-0.5 gap-1">
        <button
          className="rounded bg-white border border-transparent hover:border-red-400 text-red-600 p-0.5 flex items-center justify-center"
          style={{ width: 22, height: 22 }}
          onClick={onRemove}
          aria-label="Restar"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        {editing ? (
          <input
            type="number"
            min={0}
            className="w-8 h-8 text-center text-base border border-gray-300 rounded bg-white outline-none mx-1"
            value={inputValue}
            autoFocus
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            style={{ MozAppearance: "textfield" }}
          />
        ) : (
          <span
            className="w-8 h-8 flex items-center justify-center text-base font-semibold text-gray-900 bg-white border border-gray-300 rounded mx-1 cursor-pointer select-none"
            onClick={() => setEditing(true)}
          >
            {value}
          </span>
        )}
        <button
          className="rounded bg-white border border-transparent hover:border-green-400 text-green-600 p-0.5 flex items-center justify-center"
          style={{ width: 22, height: 22 }}
          onClick={onAdd}
          aria-label="Sumar"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}