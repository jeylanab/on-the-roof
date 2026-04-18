import { db } from './config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

// ─── BIDS ────────────────────────────────────────────────────────────────────

export const saveBid = async (bidData) => {
  const ref = await addDoc(collection(db, 'bids'), {
    ...bidData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateBid = async (bidId, bidData) => {
  const ref = doc(db, 'bids', bidId);
  await updateDoc(ref, { ...bidData, updatedAt: serverTimestamp() });
};

export const deleteBid = async (bidId) => {
  await deleteDoc(doc(db, 'bids', bidId));
};

export const getAllBids = async () => {
  const q = query(collection(db, 'bids'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getBidById = async (bidId) => {
  const snap = await getDoc(doc(db, 'bids', bidId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── PRICING CONFIG ──────────────────────────────────────────────────────────

export const savePricingConfig = async (config) => {
  await setDoc(doc(db, 'config', 'pricing'), {
    ...config,
    updatedAt: serverTimestamp(),
  });
};

export const getPricingConfig = async () => {
  const snap = await getDoc(doc(db, 'config', 'pricing'));
  return snap.exists() ? snap.data() : null;
};