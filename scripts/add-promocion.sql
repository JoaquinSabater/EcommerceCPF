-- Script para agregar tabla de promociones y contador por cliente
-- Ejecutar en la base de datos principal

-- Tabla para definir promociones de carrito
CREATE TABLE IF NOT EXISTS promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  descuento_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  max_pedidos_por_cliente INT NOT NULL DEFAULT 5,
  activa TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_promociones_activa (activa)
);

-- Columna para contar pedidos que aplican a la promoción por cliente
-- Nota: si la columna ya existe, MySQL devolverá un error "Duplicate column" que puede ignorarse
ALTER TABLE clientes_auth
  ADD COLUMN promocion_pedidos_count INT NOT NULL DEFAULT 0;
