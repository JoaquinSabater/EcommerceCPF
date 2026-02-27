-- ===========================================
-- ÍNDICES PARA OPTIMIZACIÓN DE RENDIMIENTO
-- ===========================================
-- Ejecutar este script en la base de datos MySQL
-- para mejorar el rendimiento de las consultas.
--
-- Los índices funcionan como un "índice de un libro":
-- en vez de recorrer TODAS las filas de una tabla para
-- encontrar las que coinciden, MySQL salta directamente
-- a las filas relevantes usando el índice.
-- ===========================================

-- 1. TABLA: articulos
-- Esta tabla es la más consultada. Casi todas las queries filtran por item_id, ubicacion, marca_id, etc.

-- Índice compuesto principal: cubre las queries de getArticulosPorSubcategoria, getCategorias, getMarcasConStock
-- Permite que MySQL filtre por item_id + ubicacion en una sola operación
ALTER TABLE articulos ADD INDEX idx_articulos_item_ubicacion (item_id, ubicacion);

-- Índice para filtros por marca (getCategoriasPorMarca, getMarcasConStock)
ALTER TABLE articulos ADD INDEX idx_articulos_marca (marca_id);

-- Índice para búsquedas por precio (ordenamiento frecuente)
ALTER TABLE articulos ADD INDEX idx_articulos_precio (precio_venta);

-- Índice compuesto para la query más pesada: item_id + ubicacion + precio_venta
-- Cubre getArticulosPorSubcategoria con su ORDER BY
ALTER TABLE articulos ADD INDEX idx_articulos_item_ubic_precio (item_id, ubicacion, precio_venta);

-- 2. TABLA: items
-- Filtros frecuentes por subcategoria_id y disponible

-- Índice compuesto: cubre getCategorias WHERE subcategoria_id = ? AND disponible = 1
ALTER TABLE items ADD INDEX idx_items_subcategoria_disponible (subcategoria_id, disponible);

-- 3. TABLA: item_detalle
-- JOIN frecuente por item_id

-- Índice para el JOIN con items (si no existe ya como UNIQUE)
ALTER TABLE item_detalle ADD INDEX idx_item_detalle_item (item_id);

-- 4. TABLA: cotizaciones
-- Query de getDolar() y getDolarElectronica() ordena por tipo + fecha_creacion DESC

-- Índice compuesto para la query del dólar
ALTER TABLE cotizaciones ADD INDEX idx_cotizaciones_tipo_fecha (tipo, fecha_creacion DESC);

-- 5. TABLA: item_detalle_recomendaciones
-- Query de recomendaciones filtra por item_detalle_id

ALTER TABLE item_detalle_recomendaciones ADD INDEX idx_recomendaciones_detalle (item_detalle_id, orden);

-- 6. TABLA: marcas
-- JOIN frecuente por id (probablemente ya tiene PK, pero por si acaso)
-- No necesita índice adicional si id es PRIMARY KEY

-- 7. TABLA: pedidos
-- Filtro frecuente por cliente_id
ALTER TABLE pedidos ADD INDEX idx_pedidos_cliente (cliente_id);

-- 8. TABLA: pedido_preliminar
-- Filtro frecuente por cliente_id
ALTER TABLE pedido_preliminar ADD INDEX idx_pedido_preliminar_cliente (cliente_id);

-- ===========================================
-- NOTAS:
-- - Si algún índice ya existe, MySQL dará un error "Duplicate key name"
--   que se puede ignorar de forma segura.
-- - Para verificar los índices existentes:
--   SHOW INDEX FROM articulos;
--   SHOW INDEX FROM items;
--   SHOW INDEX FROM item_detalle;
-- ===========================================
