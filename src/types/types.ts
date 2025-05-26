export type Item = {
  id: number;
  nombre: string;
  father: string;
};

export type Articulo = {
  codigo_interno: string;
  item_id: number;
  marca_id: number;
  modelo: string;
  code: string | null;
  precio_venta: number;
  ubicacion: string;
  stock_actual: number;
};