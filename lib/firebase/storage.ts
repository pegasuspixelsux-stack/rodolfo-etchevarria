import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage";
import { firebaseApp } from "@/lib/firebase";
import { resizeImageFile } from "@/lib/image-resize";

let storageInstance: FirebaseStorage | null = null;

function getFirebaseStorage(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(firebaseApp);
  }
  return storageInstance;
}

export async function uploadInventoryImage(file: File, carId: string): Promise<string> {
  const resized = await resizeImageFile(file);
  const storage = getFirebaseStorage();
  const path = `inventory/${carId}/${Date.now()}-${resized.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, resized);
  return getDownloadURL(fileRef);
}

export async function uploadHeroVideo(file: File): Promise<string> {
  const storage = getFirebaseStorage();
  const path = `site/hero-video/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function uploadHeroSlideshowImage(file: File): Promise<string> {
  const resized = await resizeImageFile(file);
  const storage = getFirebaseStorage();
  const path = `site/hero-slideshow/${Date.now()}-${resized.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, resized);
  return getDownloadURL(fileRef);
}
