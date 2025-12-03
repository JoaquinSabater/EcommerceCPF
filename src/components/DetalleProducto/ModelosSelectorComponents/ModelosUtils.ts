import { Articulo } from "@/types/types";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

export const formatModeloDisplay = (
  articulo: Articulo, 
  esSinDescuento: boolean,
  dolar: number, 
  getPrecioConDescuento: (precio: number) => number
) => {
  const marcaModelo = articulo.marca_nombre 
    ? `${articulo.marca_nombre} ${articulo.modelo}` 
    : articulo.modelo;
  
  const precioOriginalUsd = Number(articulo.precio_venta || 0);
  let precioConDescuentoUsd: number;
  let precioArs: number;
  let esPesificado = false;
  
  // ✅ LÓGICA SIMPLE Y DIRECTA
  if (esSinDescuento) {
    // Si está excluido, usar precio original sin descuento
    precioConDescuentoUsd = precioOriginalUsd;
  } else {
    // Si NO está excluido, usar la función de descuento
    precioConDescuentoUsd = getPrecioConDescuento(precioOriginalUsd);
  }
  
  // Manejar precios pesificados
  if (articulo.es_pesificado === 1 && articulo.precio_pesos && articulo.precio_pesos > 0) {
    const precioOriginalPesos = Number(articulo.precio_pesos);
    esPesificado = true;
    
    if (esSinDescuento) {
      // Sin descuento - usar precio original en pesos
      precioArs = Math.round(precioOriginalPesos);
    } else {
      // Con descuento - aplicar 20% descuento al precio en pesos
      precioArs = Math.round(precioOriginalPesos * 0.80);
    }
  } else {
    // Convertir USD a pesos usando el dólar
    precioArs = Math.round(precioConDescuentoUsd * dolar);
  }

  const stockReal = Number(articulo.stock_real || 0);
  const stockIndicador = stockReal <= 0 ? ' - Sin stock' : stockReal <= 10 ? ' - Últimos disponibles' : '';
  
  return {
    texto: `${marcaModelo} - $${precioConDescuentoUsd.toFixed(2)} USD ($${precioArs.toLocaleString()} ARS${esPesificado ? ' 🏷️' : ''}${esSinDescuento ? ' 📦' : ''})${stockIndicador}`,
    marcaModelo: marcaModelo,
    precioUsd: precioConDescuentoUsd,
    precioOriginalUsd: precioOriginalUsd,
    precioArs: precioArs,
    esPesificado: esPesificado,
    esSinDescuento: esSinDescuento,
    stockReal: stockReal,
    stockIndicador: stockIndicador
  };
};

export const getStockDisponible = (articulo: Articulo, seleccionados: ModeloSeleccionado[]) => {
  const stockTotal = Number(articulo.stock_real || 0);
  const yaSeleccionado = seleccionados.find(s => s.articulo.codigo_interno === articulo.codigo_interno);
  const cantidadSeleccionada = yaSeleccionado ? yaSeleccionado.cantidad : 0;
  return Math.max(0, stockTotal - cantidadSeleccionada);
};

export const chunkModelos = (modelosArray: Articulo[]) => {
  const chunks = [];
  for (let i = 0; i < modelosArray.length; i += 5) {
    chunks.push(modelosArray.slice(i, i + 5));
  }
  return chunks;
};