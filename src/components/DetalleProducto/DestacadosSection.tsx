import { headers } from 'next/headers';
import DestacadosCarousel, { type DestacadoItem } from './DestacadosCarousel';

interface DestacadosSectionProps {
  itemIdActual: number;
  clubSubDolarMode: boolean;
}

function getBaseUrlFromHeaders(host: string | null, proto: string | null): string {
  if (!host) return '';
  return `${proto || 'http'}://${host}`;
}

async function fetchDestacados(itemIdActual: number, clubSubDolarMode: boolean): Promise<DestacadoItem[]> {
  try {
    const hdrs = await headers();
    const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const fallbackBaseUrl = getBaseUrlFromHeaders(
      hdrs.get('x-forwarded-host') || hdrs.get('host'),
      hdrs.get('x-forwarded-proto')
    );
    const baseUrl = configuredBaseUrl || fallbackBaseUrl;

    if (!baseUrl) {
      return [];
    }

    const response = await fetch(
      `${baseUrl}/api/items-destacados?excludeItemId=${itemIdActual}&limit=12`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as DestacadoItem[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener destacados para detalle:', error);
    return [];
  }
}

export default async function DestacadosSection({
  itemIdActual,
  clubSubDolarMode,
}: DestacadosSectionProps) {
  const productosDestacados = await fetchDestacados(itemIdActual, clubSubDolarMode);

  if (productosDestacados.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-gray-200 pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Productos destacados</h2>
        <p className="mt-1 text-sm text-gray-600">Seleccionados por el equipo para que los tengas a mano.</p>
      </div>
      <DestacadosCarousel
        productos={productosDestacados}
        clubSubDolarMode={clubSubDolarMode}
      />
    </section>
  );
}
