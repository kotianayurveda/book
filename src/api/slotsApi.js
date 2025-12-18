import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const getSlotsByDay = async (day) => {
  const ref = doc(db, "slots", day);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().slots : [];
};
