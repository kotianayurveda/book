import { useState, useEffect } from "react";
import { getSlotsByDay } from "../../api/slotsApi";
import { getBookedSlots, bookAppointment } from "../../api/appointmentsApi";

export default function BookingForm() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [form, setForm] = useState({ name:"", mobile:"", description:"", slot:"" });

  useEffect(() => {
    if (!date) return;
    const day = new Date(date).toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    getSlotsByDay(day).then(setSlots);
    getBookedSlots(date).then(setBookedSlots);
  }, [date]);

  const submit = async () => {
    await bookAppointment({ ...form, date });
    alert("Appointment Booked");
  };

  return (
    <>
      <input type="date" onChange={e => setDate(e.target.value)} />
      {slots.map(s => {
        const label = `${s.start}-${s.end}`;
        return (
          <button
            key={label}
            disabled={bookedSlots.includes(label)}
            onClick={() => setForm({ ...form, slot: label })}
          >
            {label}
          </button>
        );
      })}
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Mobile" onChange={e => setForm({ ...form, mobile: e.target.value })} />
      <textarea placeholder="Problem" onChange={e => setForm({ ...form, description: e.target.value })} />
      <button onClick={submit}>Book</button>
    </>
  );
}
