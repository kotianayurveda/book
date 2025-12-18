import { useState, useEffect } from "react";
import { getSlotsByDay } from "../../api/slotsApi";
import { getBookedSlots, bookAppointment } from "../../api/appointmentsApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function BookingForm() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [form, setForm] = useState({ name: "", mobile: "", description: "", slot: "" });

  useEffect(() => {
    if (!date) return;
    const day = new Date(date).toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    getSlotsByDay(day).then(setSlots);
    getBookedSlots(date).then(setBookedSlots);
  }, [date]);

const navigate = useNavigate();

const submit = async () => {
  try {
    await bookAppointment({ ...form, date });

    // 🔹 Store mobile number in cookie (expires in 7 days)
     localStorage.setItem("mobile", form.mobile);

    toast.success("Appointment booked successfully!");

    // 🔹 Navigate to home page after short delay
    setTimeout(() => {
      navigate("/");
    }, 1200);

  } catch (error) {
    console.error(error);
    toast.error("Failed to book appointment");
  }
};

  const timeSlots = [
    // Morning
    "11:30 AM - 11:45 AM",
    "11:45 AM - 12:00 PM",
    "12:00 PM - 12:15 PM",
    "12:15 PM - 12:30 PM",
    "12:30 PM - 12:45 PM",
    "12:45 PM - 01:00 PM",
    "01:00 PM - 01:15 PM",
    "01:15 PM - 01:30 PM",

    // Evening
    "06:30 PM - 06:45 PM",
    "06:45 PM - 07:00 PM",
    "07:00 PM - 07:15 PM",
    "07:15 PM - 07:30 PM",
    "07:30 PM - 07:45 PM",
    "07:45 PM - 08:00 PM"
  ];

  const parseTimeToMinutes = (timeStr) => {
    // "11:30 AM"
    const [time, meridian] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (meridian === "PM" && hours !== 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const isSlotEligible = (slot, selectedDate) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Future date → all slots valid
    if (selectedDate !== todayStr) return true;

    // Today → check time
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    // slot = "11:30 AM - 11:45 AM"
    const startTime = slot.split("-")[0].trim();
    const slotMinutes = parseTimeToMinutes(startTime);

    return slotMinutes > nowMinutes;
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = date === todayStr;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const isAfter8PM = isToday && nowMinutes >= (20 * 60);



  return (
    <div className="container py-4">
      <h2 className="mb-4">Book an Appointment</h2>

      {/* Date */}
      <div className="mb-3">
        <label className="form-label">
          Select Date <span className="text-danger">*</span>
        </label>

        <input
          type="date"
          className={`form-control ${!date && "is-invalid"}`}
          value={date}
          min={new Date().toISOString().split("T")[0]}   // ✅ blocks past dates
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {!date && (
          <div className="invalid-feedback">
            Date is required
          </div>
        )}
      </div>


      {/* Slots */}
      {date && (
        <div className="mb-4">
          <label className="form-label fw-bold">
            Select Time Slot <span className="text-danger">*</span>
          </label>

          {isAfter8PM ? (
            <div className="alert alert-warning">
              No slots available for today. Please check tomorrow.
            </div>
          ) : (
            <div className="row g-2">
              {timeSlots
                .filter((slot) => isSlotEligible(slot, date))
                .map((slot) => {
                  const isSelected = form.slot === slot;

                  return (
                    <div className="col-6 col-md-3" key={slot}>
                      <button
                        type="button"
                        className={`btn w-100 ${isSelected
                          ? "btn-success"
                          : "btn-outline-primary"
                          }`}
                        onClick={() => setForm({ ...form, slot })}
                      >
                        {slot}
                      </button>
                    </div>
                  );
                })}
            </div>
          )}

          {!form.slot && !isAfter8PM && (
            <div className="text-danger small mt-2">
              Please select a time slot
            </div>
          )}
        </div>
      )}


      {/* Name */}
      <div className="mb-3">
        <label className="form-label">
          Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${!form.name && "is-invalid"}`}
          placeholder="Enter your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        {!form.name && <div className="invalid-feedback">Name is required</div>}
      </div>

      {/* Mobile */}
      <div className="mb-3">
        <label className="form-label">
          Mobile Number <span className="text-danger">*</span>
        </label>
        <input
          type="tel"
          className={`form-control ${(!form.mobile || form.mobile.length !== 10) && "is-invalid"
            }`}
          placeholder="Enter 10-digit mobile number"
          value={form.mobile}
          onChange={(e) =>
            setForm({
              ...form,
              mobile: e.target.value.replace(/\D/g, "")
            })
          }
          maxLength="10"
          required
        />
        {!form.mobile && (
          <div className="invalid-feedback">Mobile number is required</div>
        )}
        {form.mobile && form.mobile.length !== 10 && (
          <div className="invalid-feedback">
            Mobile number must be 10 digits
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">Problem Description</label>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Describe your problem"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
      </div>

      {/* Submit */}
      <button
        className="btn btn-success"
        disabled={!date || !form.name || form.mobile.length !== 10}
        onClick={submit}
      >
        Book Appointment
      </button>
    </div>

  );
}
