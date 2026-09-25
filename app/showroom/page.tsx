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
  let initialCars: InventoryItem[] | undefined;
  try {
    initialCars = await getInventoryOnce();
  } catch {
    // Firestore may be unreachable or rules not yet published at build/render
    // time — leave initialCars undefined (rather than []) so useInventory()
    // knows this isn't "zero items", starts in a loading state, and shows a
    // skeleton instead of a blank grid while its client-side subscription
    // fetches the real data.
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
