# EcommerceCPF — Resumen técnico

Proyecto Next.js (App Router) que implementa un ecommerce interno y panel administrativo para CellPhoneFree. Está diseñado para mostrar catálogo y gestionar operaciones comerciales (clientes, prospectos, pedidos y cuentas corrientes) con control fino sobre qué información técnica se expone públicamente.

Propósito
- Mantener la experiencia de venta: fotos, título, descripción y precio siempre visibles.
- Permitir control administrativo sobre la visibilidad de la "tabla de características" técnica (material, espesor, protección, compatibilidad, pegamento) sin ocultar el resto del contenido del producto.
- Gestionar ciclo comercial: prospectos → clientes → pedidos, con trazabilidad y control financiero (cuenta corriente).

Funciones clave (resumido, orientado a operadores)
- Gestión de catálogo y cards:
  - Cards en el inicio que muestran imagen priorizada (foto_portada → foto1..4), nombre, descripción y precio.
  - El admin puede definir qué items aparecen en la home, qué imagenes usar y el texto de las cards.
- Modal de detalle:
  - Galería responsive (desktop/mobile), campo de "sugerencias especiales" para el cliente.
  - Tabla de características técnicas que se muestra solo si el flag `activo` está habilitado por el admin.
- Administración y edición:
  - Modal admin para editar descripción, imágenes (Cloudinary) y switches: `activo` (mostrar características) y `destacar`.
  - Cambios se guardan en BD y actualizan cards y modal en tiempo real (callback onUpdate).
- Prospectos y clientes:
  - Módulo para registrar prospectos, convertir prospectos a clientes y asociar pedidos.
  - Gestión de pedidos preliminares y asignación de vendedor/cliente al momento de la conversión.
- Cuenta corriente y pedidos:
  - Registro de movimientos/comprobantes y vinculación con pedidos; trazabilidad de saldos por cliente.
  - Historial de pedidos y estado por cliente/prospecto.
- Integraciones y recursos:
  - Cloudinary para gestión y entrega de imágenes.
  - MySQL para persistencia de datos.
  - Endpoints internos (app/api) para detalle, precio y actualización de productos.

Arquitectura (resumen)
- Frontend: Next.js (App Router) con componentes React/TSX (CategoriaCard, DetalleDesktop, DetalleMobile, EditProductModal).
- Backend: Rutas API dentro de Next.js (route handlers) que consumen MySQL vía mysql2/pool centralizado.
- Imágenes: referencias/public_id en BD, subida y gestión via next-cloudinary.

Operación y seguridad
- No incluir secretos (Cloudinary, DB, AUTH) en el repositorio público.
- Validar y sanitizar entradas en endpoints PUT/POST.
- Logs y console.log útiles en desarrollo, reducir en producción.

Muchas Gracias :)
