import { useEffect, useState } from "react"; 
import {
  getAppointmentsByDate,
  updateAppointmentStatus,
  rescheduleAppointment
} from "../api/appointmentsApi";

export default function DoctorDashboard() {

  const timeSlots = [
    "11:30 AM - 11:45 AM","11:45 AM - 12:00 PM","12:00 PM - 12:15 PM","12:15 PM - 12:30 PM",
    "12:30 PM - 12:45 PM","12:45 PM - 01:00 PM","01:00 PM - 01:15 PM","01:15 PM - 01:30 PM",
    "06:30 PM - 06:45 PM","06:45 PM - 07:00 PM","07:00 PM - 07:15 PM","07:15 PM - 07:30 PM",
    "07:30 PM - 07:45 PM","07:45 PM - 08:00 PM"
  ];

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Reschedule modal state
  const [showModal, setShowModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(today);
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate]);

const loadAppointments = async (date) => {
  setLoading(true);

  const data = await getAppointmentsByDate(date);

  // 🔹 Sort by slot start time
  const sorted = [...data].sort((a, b) => {
    const getMinutes = (slot) => {
      if (!slot) return 0;

      // "11:30 AM - 11:45 AM" → "11:30 AM"
      const start = slot.split("-")[0].trim();

      let [time, period] = start.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    return getMinutes(a.slot) - getMinutes(b.slot);
  });

  setAppointments(sorted);
  setLoading(false);
};


  const cancelAppointment = async (id) => {
    await updateAppointmentStatus(
      selectedDate,
      id,
      "Cancelled",
      "Cancelled by doctor"
    );
    loadAppointments(selectedDate);
  };

  // 🔹 Open modal
  const openReschedule = (appointment) => {
    setSelectedBooking(appointment);        // Pass full object
    setRescheduleDate(selectedDate);
    setRescheduleSlot(appointment.slot || "");
    setShowModal(true);
  };

  // 🔹 Confirm reschedule
  const confirmReschedule = async () => {
    if (!rescheduleDate || !rescheduleSlot || !selectedBooking) {
      console.error("Cannot reschedule: missing booking/date/slot", selectedBooking);
      return;
    }

    await rescheduleAppointment(
      selectedDate,
      selectedBooking,     // Full booking object
      rescheduleDate,
      rescheduleSlot
    );

    setShowModal(false);
    setSelectedDate(rescheduleDate);
    loadAppointments(rescheduleDate);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Doctor Dashboard</h2>

      {/* Date Picker */}
      <div className="mb-3">
        <label className="form-label fw-bold">Select Date</label>
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading && <div className="alert alert-info">Loading appointments...</div>}

      {!loading && appointments.length === 0 && (
        <div className="alert alert-warning">
          No appointments found for {selectedDate}
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Patient</th>
                <th>Mobile</th>
                <th>Slot</th>
                <th>Status</th>
                <th width="220">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.name}</td>
                  <td>{a.mobile}</td>
                  <td>{a.slot}</td>
                  <td>
                    <span
                      className={`badge ${
                        a.status === "Cancelled"
                          ? "bg-danger"
                          : a.status === "Rescheduled"
                          ? "bg-warning text-dark"
                          : "bg-success"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      disabled={a.status === "Cancelled"}
                      onClick={() => cancelAppointment(a.appointmentId)}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => openReschedule(a)}   // Pass full object
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Reschedule Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reschedule Appointment</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* Date */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Select Date</label>
                  <input
                    type="date"
                    className="form-control"
                    min={today}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>

                {/* Slot Grid */}
                <label className="form-label fw-bold">Select Time Slot</label>
                <div className="d-flex flex-wrap gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      className={`btn ${
                        rescheduleSlot === slot
                          ? "btn-success"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setRescheduleSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn btn-success"
                  disabled={!rescheduleSlot}
                  onClick={confirmReschedule}
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
