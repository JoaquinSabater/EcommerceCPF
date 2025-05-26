import { getArticulosPorPadreConStock } from "@/data/data";
import { Articulo } from "@/types/types";
import ArticulosList from "@/components/articuloList";



export default async function Vidrios() {
  const padre = "vidrio";
  const articulos: Articulo[] = await getArticulosPorPadreConStock(padre);

  return (
    <div>
      <h1>Modelos en stock para "{padre}"</h1>
      <ArticulosList articulos={articulos} />
    </div>
  );
}