import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const bookAppointment = async (data) => {
  return await addDoc(collection(db, "appointments"), {
    ...data,
    status: "Booked",
    remarks: "",
    createdAt: serverTimestamp()
  });
};

export const getBookedSlots = async (date) => {
  const q = query(
    collection(db, "appointments"),
    where("date", "==", date),
    where("status", "==", "Booked")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().slot);
};

export const getAppointmentsByMobile = async (mobile) => {
  const q = query(
    collection(db, "appointments"),
    where("mobile", "==", mobile)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateAppointmentStatus = async (id, status, remarks) => {
  await updateDoc(doc(db, "appointments", id), { status, remarks });
};
