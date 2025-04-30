import CollectionsSidebar from "@/components/Filters/CollectionsSidebar"; // Adjust the path as needed
import CollectionsDropdown from "@/components/Filters/CollectionsDropdown"; // Adjust the path as needed

export default function Silicona() {
  return (
    <div className="flex">
      <CollectionsSidebar />
      <main className="flex-1">
        {/* Aquí va el contenido principal (productos, etc.) */}
        <CollectionsDropdown />
      </main>
    </div>
  );
}