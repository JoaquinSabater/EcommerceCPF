export type Item = {
  id: number;
  nombre: string;
  father: string;
};


export interface Articulo {
  codigo_interno: string;
  item_id: number;
  marca_id: number;
  modelo: string;
  code: string;
  precio_venta: number;
  ubicacion: string;
  stock_actual: number;
  item_nombre?: string;
  marca_nombre?: string; // ✅ Nueva propiedad
  cantidad?: number;
}

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
  hasPassword?: boolean;
  Distribuidor?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  cliente?: {  // ✅ Cambié de 'user' a 'cliente'
    id: number;
    cuil: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    vendedor_id: number;
  };
  requiresPasswordSetup?: boolean;
  disabled?: boolean; // ✅ Agregué esta propiedad
}

export interface LoginRequest {
  cuil: string;
  password?: string;
}

export interface SetPasswordRequest {
  cuil: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
  newPassword: string;
}

export interface Pedido {
  id: number;
  vendedor_id: number;
  cliente_id: number;
  fecha_creacion: string;
  estado: string;
  hora_inicio_armado?: string;
  hora_fin_armado?: string;
  armador_id?: number;
  hora_inicio_control?: string;
  hora_fin_control?: string;
  controlador_id?: number;
  remito_id?: number;
  consolidado_id?: number;
  categoria_principal_id?: number;
  observaciones_generales?: string;
  armador_nombre?: string;
  controlador_nombre?: string;
  vendedor_nombre?: string;
}

export interface ArticuloPedido {
  item_nombre: string;
  modelo: string;
  cantidad: number;
}