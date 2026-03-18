-- Agregar campos de categorías a item_detalle
-- Estas categorías permitirán clasificar productos en la sección "Find Your Favorites"
-- Nota: Si alguna columna ya existe, simplemente ignora ese error específico

ALTER TABLE item_detalle
ADD COLUMN categoria_best_sellers TINYINT(1) DEFAULT 0,
ADD COLUMN categoria_magsafe TINYINT(1) DEFAULT 0,
ADD COLUMN categoria_ofertas TINYINT(1) DEFAULT 0,
ADD COLUMN categoria_iphone TINYINT(1) DEFAULT 0,
ADD COLUMN categoria_nuevos_ingresos TINYINT(1) DEFAULT 0;
