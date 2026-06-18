import { Articulo } from "@/types/types";

type QuantityRuleItem = Pick<Articulo, "de_a_10"> | { de_a_10?: number | boolean | null };

export const isDeA10 = (item?: QuantityRuleItem | null) => Number(item?.de_a_10 || 0) === 1;

export const getQuantityStep = (item?: QuantityRuleItem | null) => (isDeA10(item) ? 10 : 1);

export const getMaxAllowedQuantity = (stock: number, item?: QuantityRuleItem | null) => {
  const step = getQuantityStep(item);
  const safeStock = Math.max(0, Math.floor(Number(stock) || 0));
  return Math.floor(safeStock / step) * step;
};

export const normalizeQuantity = (
  value: number,
  item?: QuantityRuleItem | null,
  maxStock?: number,
  min: number = 0
) => {
  const step = getQuantityStep(item);
  const maxAllowed = typeof maxStock === "number" ? getMaxAllowedQuantity(maxStock, item) : undefined;
  const safeValue = Math.max(min, Math.floor(Number(value) || 0));
  const clampedValue = typeof maxAllowed === "number" ? Math.min(safeValue, maxAllowed) : safeValue;

  return Math.floor(clampedValue / step) * step;
};

export const getInitialQuantity = (item?: QuantityRuleItem | null, maxStock?: number, fallback: number = 1) => {
  if (!isDeA10(item)) {
    return fallback;
  }

  return getMaxAllowedQuantity(maxStock ?? 0, item) >= 10 ? 10 : 0;
};
