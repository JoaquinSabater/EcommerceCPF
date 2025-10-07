import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

type QuantityButtonProps = {
  value: number;
  onAdd: () => void;
  onRemove: () => void;
  onSet: (value: number) => void;
  modelo: string;
  hideModelo?: boolean;
  size?: "xs" | "normal" | "large";
  maxStock?: number; // ✅ Nueva prop para validación
};

export default function QuantityButton({
  value,
  onAdd,
  onRemove,
  onSet,
  modelo,
  hideModelo = false,
  size = "normal",
  maxStock, // ✅ Nueva prop
}: QuantityButtonProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>(String(value));

  useEffect(() => {
    if (!editing) setInputValue(String(value));
  }, [value, editing]);

  const handleInputBlur = () => {
    setEditing(false);
    let parsed = parseInt(inputValue, 10);
    
    if (!isNaN(parsed) && parsed >= 0) {
      // ✅ FIX 1: Validar contra maxStock si está disponible
      if (maxStock !== undefined && parsed > maxStock) {
        parsed = maxStock;
        setInputValue(String(maxStock));
      }
      if (parsed !== value) onSet(parsed);
    } else {
      setInputValue(String(value));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && parseInt(val, 10) >= 0)) {
      setInputValue(val);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  // ✅ FIX 2: Tamaños mejorados para mejor visibilidad
  const buttonSize =
    size === "large"
      ? "w-10 h-10 text-lg"
      : size === "xs"
      ? "w-6 h-6 text-xs" // ✅ Aumentado de w-5 h-5
      : "w-8 h-8 text-sm"; // ✅ Aumentado de w-7 h-7
  
  const iconSize =
    size === "large"
      ? "h-5 w-5"
      : size === "xs"
      ? "h-3.5 w-3.5" // ✅ Aumentado de h-3 w-3
      : "h-4 w-4";
  
  const containerGap =
    size === "large"
      ? "gap-2"
      : size === "xs"
      ? "gap-1" // ✅ Aumentado de gap-0.5
      : "gap-1.5"; // ✅ Aumentado de gap-1
  
  const fontSize =
    size === "large"
      ? "text-lg"
      : size === "xs"
      ? "text-xs"
      : "text-sm";
  
  const btnStyle =
    size === "large"
      ? { width: 40, height: 40 }
      : size === "xs"
      ? { width: 24, height: 24 } // ✅ Aumentado de 20x20
      : { width: 32, height: 32 }; // ✅ Aumentado de 28x28
  
  const inputWidth = size === "large" ? 40 : size === "xs" ? 24 : 32; // ✅ Ajustado

  return (
    <div className={`flex flex-col items-center ${containerGap} w-full`}>
      {!hideModelo && (
        <span className="text-[13px] font-semibold text-gray-800 text-center leading-tight truncate w-full">
          {modelo}
        </span>
      )}
      <div className={`flex items-center bg-gray-100 rounded-md px-2 py-1 ${containerGap}`}>
        <button
          className={`rounded-md bg-white border border-gray-300 hover:border-red-400 text-red-600 flex items-center justify-center transition-colors ${buttonSize}`}
          style={btnStyle}
          onClick={onRemove}
          aria-label="Restar"
        >
          <MinusIcon className={iconSize} />
        </button>
        
        {editing ? (
          <input
            type="number"
            min={0}
            max={maxStock} // ✅ Agregar max attribute
            className={`text-center border border-gray-300 rounded-md bg-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mx-1 ${buttonSize} ${fontSize}`}
            value={inputValue}
            autoFocus
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            style={{ MozAppearance: "textfield", width: inputWidth }}
          />
        ) : (
          <span
            className={`flex items-center justify-center font-semibold text-gray-900 bg-white border border-gray-300 rounded-md mx-1 cursor-pointer select-none hover:border-gray-400 transition-colors ${buttonSize} ${fontSize}`}
            style={{ width: inputWidth, height: btnStyle.height }}
            onClick={() => setEditing(true)}
          >
            {value}
          </span>
        )}
        
        <button
          className={`rounded-md bg-white border border-gray-300 hover:border-green-400 text-green-600 flex items-center justify-center transition-colors ${buttonSize}`}
          style={btnStyle}
          onClick={onAdd}
          aria-label="Sumar"
        >
          <PlusIcon className={iconSize} />
        </button>
      </div>
    </div>
  );
}