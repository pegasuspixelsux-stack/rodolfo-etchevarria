"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/db";
import { toInventoryItem, type InventoryItem } from "@/lib/dashboard-data";

const COLLECTION = "inventory";

export function useInventory(initialItems?: InventoryItem[]) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems ?? []);
  const [loading, setLoading] = useState(initialItems === undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snapshot) => {
        setItems(snapshot.docs.map((docSnap) => toInventoryItem(docSnap.id, docSnap.data())));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  async function addVehicle(item: InventoryItem): Promise<void> {
    const db = getFirebaseDb();
    const { id, ...data } = item;
    await setDoc(doc(db, COLLECTION, id), data);
  }

  async function updateVehicle(id: string, patch: Partial<Omit<InventoryItem, "id">>): Promise<void> {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), patch);
  }

  async function deleteVehicle(id: string): Promise<void> {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }

  return { items, loading, error, addVehicle, updateVehicle, deleteVehicle };
}
