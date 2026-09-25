import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/db";
import { toInventoryItem, type InventoryItem } from "@/lib/dashboard-data";

const COLLECTION = "inventory";

export async function getInventoryOnce(): Promise<InventoryItem[]> {
  const db = getFirebaseDb();
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((docSnap) => toInventoryItem(docSnap.id, docSnap.data()));
}
