"use client";

import { useState, useEffect } from "react";
import { Articulo } from "@/types/types";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/hooks/useAuth";
import ProductoUnico from "./ProductoUnico";
import ModelosSelectorHeader from "./ModelosSelectorComponents/ModelosSelectorHeader";
import ModelosRecomendados from "./ModelosSelectorComponents/ModelosRecomendados";
import ModelosBuscador from "./ModelosSelectorComponents/ModelosBuscador";
import ModelosListbox from "./ModelosSelectorComponents/ModelosListbox";
import ModelosSeleccionados from "./ModelosSelectorComponents/ModelosSeleccionados";
import { formatModeloDisplay, getStockDisponible } from "./ModelosSelectorComponents/ModelosUtils";
import { showError, showInfo, showSuccess, showWarning } from "@/lib/swal";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

interface ModelosSelectorProps {
  subcategoriaId: number; // Para exclusiones de descuento
  itemId: number; // Para APIs
  sugerenciaActual?: string;
  clubSubDolarMode?: boolean;
}

export default function ModelosSelector({ subcategoriaId, itemId, sugerenciaActual = '', clubSubDolarMode = false }: ModelosSelectorProps) {
  const [modelos, setModelos] = useState<Articulo[]>([]);
  const [articuloUnico, setArticuloUnico] = useState<Articulo | null>(null);
  const [seleccionados, setSeleccionados] = useState<ModeloSeleccionado[]>([]);
  const [modeloActual, setModeloActual] = useState<Articulo | null>(null);
  const [cantidadActual, setCantidadActual] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [dolar, setDolar] = useState<number>(1);
  const [loadingModelos, setLoadingModelos] = useState<boolean>(true);
  const [modelosRecomendados, setModelosRecomendados] = useState<string[]>([]);
  const [esModoSimple, setEsModoSimple] = useState<boolean>(false);

  const { addToCart } = useCart();
  const { isAdmin, getPrecioConDescuento, isDistribuidor, esCategoriaExcluida } = useAuth();

  const esSinDescuento = esCategoriaExcluida(subcategoriaId);

  useEffect(() => {
    async function fetchDolar() {
      try {
        const endpoint = esSinDescuento ? '/api/dolar-electronica' : '/api/dolar';
        const res = await fetch(endpoint);
        const data = await res.json();
        setDolar(data.dolar || 1);
        
        console.log(`🟡 Cotización cargada para ${esSinDescuento ? 'categoría excluida' : 'general'}:`, data.dolar);
      } catch (e) {
        console.error('Error cargando cotización:', e);
        setDolar(1);
      }
    }
    fetchDolar();
  }, [esSinDescuento]);

  useEffect(() => {
    setLoadingModelos(true);
    setArticuloUnico(null);

    const fetchData = async () => {
      try {
        const articulosResponse = await fetch(`/api/articulosPorSubcategoria?subcategoriaId=${itemId}${clubSubDolarMode ? '&clubSubDolar=1' : ''}`);
        const articulosData = await articulosResponse.json();

        const articulos = articulosData.articulos || [];
        const articulosConStock = articulos.filter((a: Articulo) => Number(a.stock_real || 0) > 0);

        setModelos(articulos);

        const modoSimple = articulosConStock.length === 1;
        setEsModoSimple(modoSimple);

        if (modoSimple) {
          setArticuloUnico(articulosConStock[0]);
          setModelosRecomendados([]);
          return;
        }

        try {
          const recomendacionesResponse = await fetch(`/api/recomendaciones?itemId=${itemId}`);
          const recomendacionesData = await recomendacionesResponse.json();
          setModelosRecomendados(recomendacionesData.recomendaciones || []);
        } catch {
          setModelosRecomendados(["A25", "A15", "G04", "G14", "EDGE 50 ULTRA"]);
        }
      } catch (error) {
        console.error('Error cargando modelos:', error);
        setModelos([]);
        setArticuloUnico(null);
        setEsModoSimple(false);
      } finally {
        setLoadingModelos(false);
      }
    };

    fetchData();
  }, [itemId, clubSubDolarMode]);

  if (esModoSimple) {
    return (
      <ProductoUnico 
        itemId={itemId}
        subcategoriaId={subcategoriaId}
        initialArticulo={articuloUnico}
        initialDolar={dolar}
        sugerenciaActual={sugerenciaActual}
        clubSubDolarMode={clubSubDolarMode}
      />
    );
  }

  const modelosDisponibles = modelos.filter(
    (m) => !seleccionados.some((s) => s.articulo.modelo === m.modelo) && Number(m.stock_real || 0) > 0
  );

  const modelosFiltrados = modelosDisponibles.filter(modelo =>
    modelo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (modelo.marca_nombre && modelo.marca_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddModelo = () => {
    if (modeloActual && cantidadActual > 0) {
      const stockDisponible = getStockDisponible(modeloActual, seleccionados);
      const cantidadFinal = Math.min(cantidadActual, stockDisponible);
      
      if (cantidadFinal <= 0) {
        showWarning('Stock insuficiente', `${modeloActual.modelo} tiene ${stockDisponible} unidades disponibles.`);
        return;
      }
      
      if (cantidadFinal < cantidadActual) {
        showInfo('Cantidad ajustada', `Solo se pueden agregar ${cantidadFinal} unidades de ${modeloActual.modelo}.`);
      }
      
      setSeleccionados([...seleccionados, { articulo: modeloActual, cantidad: cantidadFinal }]);
      setModeloActual(null);
      setCantidadActual(1);
      setSearchTerm("");
    }
  };

  const handleCantidadChange = (value: number) => {
    if (modeloActual) {
      const stockDisponible = getStockDisponible(modeloActual, seleccionados);
      const cantidadMaxima = Math.min(value, stockDisponible);
      setCantidadActual(cantidadMaxima);
      
      if (value > stockDisponible) {
        console.warn(`Cantidad limitada por stock disponible: ${stockDisponible}`);
      }
    } else {
      setCantidadActual(value);
    }
  };

  const handleRemoveSeleccionado = (modelo: string) => {
    setSeleccionados(seleccionados.filter((s) => s.articulo.modelo !== modelo));
  };

  const handleAddToCart = () => {
    for (const { articulo, cantidad } of seleccionados) {
      const stockActual = Number(articulo.stock_real || 0);
      if (cantidad > stockActual) {
        showError('Error de stock', `${articulo.modelo} tiene ${stockActual} unidades, intentas agregar ${cantidad}.`);
        return;
      }
    }

    seleccionados.forEach(({ articulo, cantidad }) => {
      if (!articulo.precio_venta || isNaN(Number(articulo.precio_venta))) {
        console.warn(`Artículo sin precio válido: ${articulo.modelo}`);
        articulo.precio_venta = 0;
      }
      
      const articuloConCantidad = {
        ...articulo,
        cantidad: cantidad,
        precio_venta: Number(articulo.precio_venta)
      };
      
      addToCart(articuloConCantidad, articulo.modelo, cantidad, sugerenciaActual);
    });
    
    const totalPesos = seleccionados.reduce((sum, { articulo, cantidad }) => {
      const displayInfo = formatModeloDisplay(articulo, esSinDescuento, dolar, getPrecioConDescuento);
      return sum + (displayInfo.precioArs * cantidad);
    }, 0);
    
    const tieneDescuento = !esSinDescuento && isDistribuidor();
    const tipoProducto = esSinDescuento ? ' (Sin descuento especial)' : '';
    
    const mensajeConSugerencia = sugerenciaActual 
      ? `Se agregaron ${seleccionados.length} modelo(s) al carrito con sugerencias especiales${tipoProducto}. Total: $${Math.round(totalPesos).toLocaleString()} ARS${tieneDescuento ? ' (con descuento distribuidor)' : ''}`
      : `Se agregaron ${seleccionados.length} modelo(s) al carrito${tipoProducto}. Total: $${Math.round(totalPesos).toLocaleString()} ARS${tieneDescuento ? ' (con descuento distribuidor)' : ''}`;
      
    showSuccess('Modelos agregados', mensajeConSugerencia);
    setSeleccionados([]);
  };

  const handleSearchSelect = (modelo: Articulo) => {
    setModeloActual(modelo);
    setSearchTerm("");
    setIsSearchFocused(false);
    const stockDisponible = getStockDisponible(modelo, seleccionados);
    if (cantidadActual > stockDisponible) {
      setCantidadActual(Math.max(1, stockDisponible));
    }
  };

  const handleRecomendadoSelect = (modeloNombre: string) => {
    const modeloEncontrado = modelos.find(m => m.modelo === modeloNombre);
    if (modeloEncontrado) {
      const stockDisponible = getStockDisponible(modeloEncontrado, seleccionados);
      if (stockDisponible > 0) {
        setModeloActual(modeloEncontrado);
        setCantidadActual(1);
      } else {
        showWarning('Sin stock', `${modeloNombre} no tiene stock disponible.`);
      }
    }
  };

  return (
    <div>
      <ModelosSelectorHeader 
        esSinDescuento={esSinDescuento}
        isDistribuidor={isDistribuidor}
        sugerenciaActual={sugerenciaActual}
      />

      <ModelosBuscador
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        modelosFiltrados={modelosFiltrados}
        seleccionados={seleccionados}
        esSinDescuento={esSinDescuento}
        dolar={dolar}
        getPrecioConDescuento={getPrecioConDescuento}
        isDistribuidor={isDistribuidor}
        onSearchSelect={handleSearchSelect}
        loadingModelos={loadingModelos}
      />

      <ModelosListbox
        modeloActual={modeloActual}
        setModeloActual={setModeloActual}
        cantidadActual={cantidadActual}
        setCantidadActual={setCantidadActual}
        modelosFiltrados={modelosFiltrados}
        seleccionados={seleccionados}
        searchTerm={searchTerm}
        esSinDescuento={esSinDescuento}
        dolar={dolar}
        getPrecioConDescuento={getPrecioConDescuento}
        isDistribuidor={isDistribuidor}
        onAddModelo={handleAddModelo}
        onCantidadChange={handleCantidadChange}
        loadingModelos={loadingModelos}
      />

      <ModelosSeleccionados
        seleccionados={seleccionados}
        esSinDescuento={esSinDescuento}
        dolar={dolar}
        getPrecioConDescuento={getPrecioConDescuento}
        isDistribuidor={isDistribuidor}
        onRemoveSeleccionado={handleRemoveSeleccionado}
        onAddToCart={handleAddToCart}
        sugerenciaActual={sugerenciaActual}
      />

      {isSearchFocused && searchTerm && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsSearchFocused(false)}
        />
      )}
    </div>
  );
}