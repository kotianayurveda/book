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
    <div className="container py-4">
      <h2 className="mb-4">Book an Appointment</h2>
      
      <div className="mb-3">
        <label className="form-label">Select Date</label>
        <input 
          type="date" 
          className="form-control" 
          onChange={e => setDate(e.target.value)} 
        />
      </div>

      {slots.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Available Time Slots</label>
          <div className="d-flex flex-wrap gap-2">
            {slots.map(s => {
              const label = `${s.start}-${s.end}`;
              const isBooked = bookedSlots.includes(label);
              const isSelected = form.slot === label;
              return (
                <button
                  key={label}
                  className={`btn ${isSelected ? 'btn-primary' : isBooked ? 'btn-secondary' : 'btn-outline-primary'}`}
                  disabled={isBooked}
                  onClick={() => setForm({ ...form, slot: label })}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Name</label>
        <input 
          type="text"
          className="form-control" 
          placeholder="Enter your name" 
          onChange={e => setForm({ ...form, name: e.target.value })} 
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Mobile Number</label>
        <input 
          type="tel"
          className="form-control" 
          placeholder="Enter your mobile number" 
          onChange={e => setForm({ ...form, mobile: e.target.value })} 
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Problem Description</label>
        <textarea 
          className="form-control" 
          rows="3"
          placeholder="Describe your problem" 
          onChange={e => setForm({ ...form, description: e.target.value })} 
        />
      </div>

      <button className="btn btn-success" onClick={submit}>Book Appointment</button>
    </div>
  );
}
