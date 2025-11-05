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
  maxStock?: number;
};

export default function QuantityButton({
  value,
  onAdd,
  onRemove,
  onSet,
  modelo,
  hideModelo = false,
  size = "normal",
  maxStock,
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
      // ✅ Validar contra maxStock si está disponible (SIN ALERT)
      if (maxStock !== undefined && parsed > maxStock) {
        parsed = maxStock;
        setInputValue(String(maxStock));
      }
      if (parsed !== value) onSet(parsed);
    } else {
      setInputValue(String(value));
    }
  };

  // ✅ CORREGIDO: Solo verificar límite, sin alert
  const handleAdd = () => {
    if (maxStock !== undefined && value >= maxStock) {
      return; // No hacer nada si se alcanzó el máximo
    }
    onAdd(); // Solo ejecutar si no se excede el stock
  };

  // ✅ CORREGIDO: Manejar cambios en input sin alert
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValueStr = e.target.value;
    setInputValue(newValueStr);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  // ✅ NUEVO: Verificar si el botón + debe estar deshabilitado
  const isPlusDisabled = maxStock !== undefined && value >= maxStock;

  // Tamaños mejorados
  const buttonSize =
    size === "large"
      ? "w-10 h-10 text-lg"
      : size === "xs"
      ? "w-6 h-6 text-xs"
      : "w-8 h-8 text-sm";
  
  const iconSize =
    size === "large"
      ? "h-5 w-5"
      : size === "xs"
      ? "h-3.5 w-3.5"
      : "h-4 w-4";
  
  const containerGap =
    size === "large"
      ? "gap-2"
      : size === "xs"
      ? "gap-1"
      : "gap-1.5";
  
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
      ? { width: 24, height: 24 }
      : { width: 32, height: 32 };
  
  const inputWidth = size === "large" ? 40 : size === "xs" ? 24 : 32;

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
            max={maxStock}
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
          className={`rounded-md border flex items-center justify-center transition-colors ${buttonSize} ${
            isPlusDisabled
              ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-300 hover:border-green-400 text-green-600'
          }`}
          style={btnStyle}
          onClick={handleAdd}
          disabled={isPlusDisabled}
          aria-label="Sumar"
          title={isPlusDisabled ? `Máximo disponible: ${maxStock}` : "Aumentar cantidad"}
        >
          <PlusIcon className={iconSize} />
        </button>
      </div>
      
      {/* ✅ NUEVO: Cartelito cuando se alcanza el límite máximo */}
      {maxStock !== undefined && value >= maxStock && maxStock > 0 && (
        <p className="text-xs text-red-600 text-center mt-1 bg-red-50 px-2 py-1 rounded-full">
          ¡Máximo disponible!
        </p>
      )}
      
      {/* ✅ NUEVO: Cartelito para indicar pocas unidades restantes */}
      {maxStock !== undefined && maxStock <= 5 && maxStock > 0 && value < maxStock && (
        <p className="text-xs text-amber-600 text-center mt-1">
          ¡Últimas {maxStock} unidades!
        </p>
      )}
    </div>
  );
}