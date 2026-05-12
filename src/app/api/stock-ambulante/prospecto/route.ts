import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';

type ProspectoRow = {
  id: number;
  telefono: string | null;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  cuit: string | null;
  razon_social: string | null;
};

function tieneValor(v: unknown): boolean {
  if (typeof v === 'string') {
    return v.trim().length > 0;
  }
  return v !== null && v !== undefined;
}

function datosCompletos(p: Partial<ProspectoRow>): boolean {
  return (
    tieneValor(p.telefono) &&
    tieneValor(p.email) &&
    tieneValor(p.nombre) &&
    tieneValor(p.apellido) &&
    tieneValor(p.cuit) &&
    tieneValor(p.razon_social)
  );
}

export async function GET(request: NextRequest) {
  try {
    const prospectoId = request.nextUrl.searchParams.get('prospecto_id');

    if (!prospectoId) {
      return NextResponse.json(
        { success: false, error: 'prospecto_id es requerido' },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT id, telefono, email, nombre, apellido, cuit, razon_social
       FROM prospectos
       WHERE id = ?
       LIMIT 1`,
      [prospectoId]
    );

    const rowsArray = Array.isArray(rows) ? rows : [];
    const prospecto = (rowsArray[0] as ProspectoRow | undefined) ?? undefined;

    if (!prospecto) {
      return NextResponse.json(
        { success: false, error: 'Prospecto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prospecto,
      datosCompletos: datosCompletos(prospecto)
    });
  } catch (error) {
    console.error('Error al obtener prospecto para stock ambulante:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener prospecto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const prospectoId = body.prospecto_id;
    const telefono = String(body.telefono ?? '').trim();
    const email = String(body.email ?? '').trim();
    const nombre = String(body.nombre ?? '').trim();
    const apellido = String(body.apellido ?? '').trim();
    const cuit = String(body.cuit ?? '').trim();
    const razonSocial = String(body.razon_social ?? '').trim();

    if (!prospectoId) {
      return NextResponse.json(
        { success: false, error: 'prospecto_id es requerido' },
        { status: 400 }
      );
    }

    if (!telefono || !email || !nombre || !apellido || !cuit || !razonSocial) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: telefono, email, nombre, apellido, cuit, razon_social'
        },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `UPDATE prospectos
       SET telefono = ?, email = ?, nombre = ?, apellido = ?, cuit = ?, razon_social = ?
       WHERE id = ?`,
      [telefono, email, nombre, apellido, cuit, razonSocial, prospectoId]
    );

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Prospecto no encontrado o sin cambios' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Datos del prospecto actualizados correctamente',
      datosCompletos: true
    });
  } catch (error) {
    console.error('Error al actualizar prospecto para stock ambulante:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar datos del prospecto' },
      { status: 500 }
    );
  }
}
