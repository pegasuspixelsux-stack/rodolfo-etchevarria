import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShowroomView } from "@/components/showroom/showroom-view";
import { getInventoryOnce } from "@/lib/firebase/inventory-read";
import type { InventoryItem } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Sala de Exhibición — Rodolfo Etchevarria",
  description:
    "Explorá el inventario completo de Rodolfo Etchevarria con búsqueda avanzada por marca, precio, carrocería y combustible.",
};

export default async function ShowroomPage() {
  let initialCars: InventoryItem[] = [];
  try {
    initialCars = await getInventoryOnce();
  } catch {
    // Firestore may be unreachable or rules not yet published at build/render
    // time — fall back to an empty seed and let the client-side subscription
    // in useInventory() pick up data (and surface its own error) at runtime.
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar />
      <main className="flex-1 bg-background pt-24 sm:pt-28">
        <ShowroomView initialCars={initialCars} />
      </main>
      <Footer />
    </div>
  );
}
