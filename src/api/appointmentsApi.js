import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  doc,
  arrayUnion,
  Timestamp,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const bookAppointment = async (data) => {
  if (!data.date) {
    throw new Error("Appointment date is required");
  }

  // ✅ Use selected date, NOT today
  const selectedDate = data.date; // YYYY-MM-DD

  const docRef = doc(db, "appointments", selectedDate);

  const appointment = {
    appointmentId: crypto.randomUUID(),
    name: data.name,
    mobile: data.mobile,
    description: data.description || "",
    slot: data.slot,
    date: selectedDate,
    status: "Booked",
    remarks: "",
    createdAt: Timestamp.now()
  };

  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // 🔹 Create document for selected date
    await setDoc(docRef, {
      date: selectedDate,
      appointments: [appointment]
    });
  } else {
    // 🔹 Append to that date’s appointments
    await updateDoc(docRef, {
      appointments: arrayUnion(appointment)
    });
  }

  return true;
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
  const today = new Date().toISOString().split("T")[0];
  const snap = await getDocs(collection(db, "appointments"));

  let results = [];

  snap.forEach(doc => {
    const date = doc.id; // YYYY-MM-DD

    if (date >= today) {
      const appointments = doc.data().appointments || [];
      const matched = appointments.filter(a => a.mobile === mobile);
      results.push(...matched);
    }
  });

  // Sort by date + slot
  return results.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.slot.localeCompare(b.slot);
  });
};

export const getAppointmentsByDate = async (date) => {
  const docRef = doc(db, "appointments", date);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return [];
  return snap.data().appointments || [];
};

export const updateAppointmentStatus = async (date, appointmentId, status, remarks) => {
  const docRef = doc(db, "appointments", date);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const appointments = snap.data().appointments || [];
  const updatedAppointments = appointments.map((a) =>
    a.appointmentId === appointmentId ? { ...a, status, remarks, updatedAt: Timestamp.now() } : a
  );

  await updateDoc(docRef, { appointments: updatedAppointments });
};

// Reschedule appointment
export const rescheduleAppointment = async (oldDate, booking, newDate, newSlot) => {
  console.log(booking)
  if (!booking || !booking.appointmentId) {
    console.error("Invalid booking object", booking);
    return;
  }

  const oldDocRef = doc(db, "appointments", oldDate);
  const newDocRef = doc(db, "appointments", newDate);

  const updatedBooking = {
    ...booking,
    date: newDate,
    slot: newSlot,
    status: "Rescheduled",
    remarks: "Rescheduled by doctor",
    updatedAt: Timestamp.now()
  };

  // 🔹 Same date: just update slot/status
  if (oldDate === newDate) {
    const oldSnap = await getDoc(oldDocRef);
    if (oldSnap.exists()) {
      const appointments = oldSnap.data().appointments || [];
      const updatedAppointments = appointments.map((a) =>
        a.appointmentId === booking.appointmentId ? updatedBooking : a
      );
      await updateDoc(oldDocRef, { appointments: updatedAppointments });
    }
    return;
  }

  // 🔹 Different date: remove from old date
  const oldSnap = await getDoc(oldDocRef);
  if (oldSnap.exists()) {
    const oldAppointments = oldSnap.data().appointments || [];
    const filteredAppointments = oldAppointments.filter(
      (a) => a.appointmentId !== booking.appointmentId
    );
    await updateDoc(oldDocRef, { appointments: filteredAppointments });
  }

  // 🔹 Add to new date
  const newSnap = await getDoc(newDocRef);
  if (!newSnap.exists()) {
    await setDoc(newDocRef, {
      date: newDate,
      appointments: [updatedBooking]
    });
  } else {
    await updateDoc(newDocRef, {
      appointments: arrayUnion(updatedBooking)
    });
  }

  console.log(`Appointment ${booking.appointmentId} rescheduled from ${oldDate} to ${newDate}`);
};