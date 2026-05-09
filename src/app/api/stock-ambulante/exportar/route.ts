import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const usuarioId = searchParams.get('usuario_id');
    const prospectoFlag = searchParams.get('prospecto') || searchParams.get('prospecto_id');

    // Token fijo del ERP para obtener el stock ambulante
    const ERP_TOKEN = 'fe3493287c3a953cae08234baa2097ba896033989eb3f61fe6f6402ecbf465a7';

    // Si viene prospectoFlag (p. ej. ?prospecto=1 o ?prospecto_id=8143), usamos la API TOTAL
    // y siempre debemos enviar usuario_id=0 al ERP para obtener el stock total.
    let erpUrl: string;
    if (prospectoFlag) {
      erpUrl = `http://cellphonefree.com.ar/accesorios/Sistema/scrphp/api/stock/exportar_stock_ambulante_total.php?token=${ERP_TOKEN}&formato=json&usuario_id=0`;
    } else {
      if (!usuarioId) {
        return NextResponse.json(
          { success: false, message: 'usuario_id es requerido' },
          { status: 400 }
        );
      }

      // Hacer la petición al ERP desde el servidor (stock filtrado por usuario)
      erpUrl = `http://cellphonefree.com.ar/accesorios/Sistema/scrphp/api/stock/exportar_stock_ambulante.php?token=${ERP_TOKEN}&formato=json&usuario_id=${usuarioId}`;
    }
    
    console.log('🔍 Solicitando stock ambulante al ERP:', { usuarioId });
    
    const response = await fetch(erpUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // No cachear para obtener datos frescos
      cache: 'no-store',
      // Agregar timeout de 30 segundos
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      console.error('❌ Error en respuesta del ERP:', response.status);
      return NextResponse.json(
        { success: false, message: 'Error al obtener datos del ERP' },
        { status: 502 }
      );
    }

    const data = await response.json();
    
    console.log('✅ Stock ambulante obtenido:', data.data?.length || 0, 'artículos');

    // Retornar los datos tal como vienen del ERP
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Error al exportar stock ambulante:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
