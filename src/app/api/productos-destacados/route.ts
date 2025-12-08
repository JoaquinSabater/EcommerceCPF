import { NextRequest, NextResponse } from 'next/server';
import { getCategorias } from '@/data/data';
import { db } from '@/data/mysql';

// ✅ OPTIMIZADO: Cache ISR de 30 minutos (productos destacados cambian poco)
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT DISTINCT i.subcategoria_id
      FROM item_detalle id_table
      JOIN items i ON id_table.item_id = i.id
      WHERE id_table.destacar = 1
    `;

    const [rows]: any = await db.query(query);
    
    if (rows.length === 0) {
      return NextResponse.json([]);
    }

    let productosDestacados = [];
    
    for (const row of rows) {
      const categorias = await getCategorias(row.subcategoria_id);
      
      const categoriasDestacadas = await Promise.all(
        categorias.map(async (categoria) => {
          const [destacadoRows]: any = await db.query(
            'SELECT destacar FROM item_detalle WHERE item_id = ?',
            [categoria.id]
          );
          
          return destacadoRows.length > 0 && destacadoRows[0].destacar === 1 ? categoria : null;
        })
      );
      
      productosDestacados.push(...categoriasDestacadas.filter(Boolean));
    }

    //console.log('Productos destacados encontrados:', productosDestacados.length);
    
    return NextResponse.json(productosDestacados);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos destacados' },
      { status: 500 }
    );
  }
}