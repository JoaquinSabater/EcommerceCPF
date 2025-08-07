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
  item_nombre: string;
};

export type categorias = {
  id: number;
  nombre: string;
  imagen?: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  domicilio: string;
  cuil: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}