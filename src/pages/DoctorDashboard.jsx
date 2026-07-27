import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  bookAppointment,
  getAppointmentsByDate
} from "../api/appointmentsApi";

export default function DoctorDashboard() {

  const timeSlots = [
    "12:00 PM - 12:15 PM",
    "12:15 PM - 12:30 PM",
    "12:30 PM - 12:45 PM",
    "12:45 PM - 01:00 PM",
    "07:00 PM - 07:15 PM",
    "07:15 PM - 07:30 PM",
    "07:30 PM - 07:45 PM",
    "07:45 PM - 08:00 PM"
  ];

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    mobile: "",
    remarks: "",
    mode: "Offline",
    date: today,
    slot: ""
  });

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate]);

  const setManualValue = (field, value) => {
    setManualForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "date" ? { slot: "" } : {})
    }));
  };

  const getMinutes = (slot) => {
    if (!slot) return 0;

    const start = slot.split("-")[0].trim();
    const parts = start.split(" ");

    if (parts.length === 1 && parts[0].includes(":")) {
      const [hours, minutes] = parts[0].split(":").map(Number);
      return hours * 60 + minutes;
    }

    let [hours, minutes] = parts[0].split(":").map(Number);
    const period = parts[1];

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const sortAppointments = (data) =>
    [...data].sort((a, b) => getMinutes(a.slot) - getMinutes(b.slot));

  const isSlotEligible = (slot, selectedDate) => {
    if (!selectedDate || selectedDate !== today) return true;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return getMinutes(slot) > nowMinutes;
  };

  const getAvailableSlots = (date) =>
    timeSlots.filter((slot) => isSlotEligible(slot, date));

  const loadAppointments = async (date) => {
    setLoading(true);

    try {
      const data = await getAppointmentsByDate(date);
      setAppointments(sortAppointments(data));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const getSlotStartTime = (slot) => {
    if (!slot) return "";
    return slot.split("-")[0].trim();
  };

  const getWhatsappPhone = (mobile) => {
    const digits = String(mobile || "").replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const openWhatsapp = (mobile, message) => {
    const phone = getWhatsappPhone(mobile);
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`,
      "kotian-ayurveda-whatsapp",
      "noopener,noreferrer"
    );
  };

  const getConfirmationMessage = (appointment) =>
    `Hello *${appointment.name}*, \nThank you for reaching *Kotian Ayurveda*, \n\nYour appointment is booked for *${formatDisplayDate(appointment.date)}* at *${getSlotStartTime(appointment.slot)}*.\n\nRegards\n*Kotian Ayurveda*`;

  const getReminderMessage = (appointment) =>
    `Hello *${appointment.name}*, \nThank you for reaching *Kotian Ayurveda*, \n\nYour appointment is booked for *${formatDisplayDate(appointment.date)}* at *${getSlotStartTime(appointment.slot)}*.\n\nRegards\n*Kotian Ayurveda*`;

  const submitManualAppointment = async (event) => {
    event.preventDefault();

    if (!manualForm.name.trim() || manualForm.mobile.length !== 10 || !manualForm.date || !manualForm.slot) {
      toast.error("Please fill name, 10-digit phone number, date and time slot");
      return;
    }

    const appointment = {
      name: manualForm.name.trim(),
      mobile: manualForm.mobile,
      remarks: manualForm.remarks.trim(),
      mode: manualForm.mode,
      date: manualForm.date,
      slot: manualForm.slot
    };

    setSaving(true);

    try {
      await bookAppointment(appointment);
      toast.success("Appointment added successfully");
      openWhatsapp(appointment.mobile, getConfirmationMessage(appointment));
      setManualForm({
        name: "",
        mobile: "",
        remarks: "",
        mode: "Offline",
        date: today,
        slot: ""
      });
      setSelectedDate(today);
      await loadAppointments(today);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-page container py-3 py-md-4">
      <h2 className="page-title mb-3 mb-md-4">Doctor Dashboard</h2>

      <div className="card appointment-form-card mb-4 text-start">
        <div className="card-header fw-bold">Add Appointment Manually</div>
        <div className="card-body">
          <form onSubmit={submitManualAppointment}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={manualForm.name}
                  onChange={(e) => setManualValue("name", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                <input
                  type="tel"
                  className="form-control"
                  value={manualForm.mobile}
                  maxLength="10"
                  onChange={(e) => setManualValue("mobile", e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Appointment Type</label>
                <select
                  className="form-select"
                  value={manualForm.mode}
                  onChange={(e) => setManualValue("mode", e.target.value)}
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Appointment Date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={manualForm.date}
                  onChange={(e) => setManualValue("date", e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold">Appointment Time Slot <span className="text-danger">*</span></label>
                {getAvailableSlots(manualForm.date).length === 0 ? (
                  <div className="alert alert-warning mb-0">
                    No slots available for today. Please select another date.
                  </div>
                ) : (
                  <div className="slot-grid">
                    {getAvailableSlots(manualForm.date).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`btn slot-button ${
                          manualForm.slot === slot
                            ? "btn-success"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setManualValue("slot", slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={manualForm.remarks}
                  onChange={(e) => setManualValue("remarks", e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success submit-button mt-3"
              disabled={saving}
            >
              {saving ? "Saving..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      <div className="appointments-header d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3 text-start">
        <div>
          <h4 className="mb-1">
            {selectedDate === today ? "Today's Appointments" : "Appointments"}
          </h4>
          <div className="text-muted">{formatDisplayDate(selectedDate)}</div>
        </div>

        <div>
          <label className="form-label fw-bold">View Another Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading appointments...</div>}

      {!loading && appointments.length === 0 && (
        <div className="alert alert-warning">
          No appointments found for {formatDisplayDate(selectedDate)}
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <>
        <div className="appointment-card-list d-md-none">
          {appointments.map((a) => (
            <div className="appointment-card" key={a.appointmentId}>
              <div className="d-flex justify-content-between gap-3">
                <div>
                  <div className="appointment-name">{a.name}</div>
                  <a className="appointment-phone" href={`tel:${a.mobile}`}>
                    {a.mobile}
                  </a>
                </div>
                <span className={`appointment-type ${a.mode === "Online" ? "online" : "offline"}`}>
                  {a.mode || "Offline"}
                </span>
              </div>

              <div className="appointment-slot">{a.slot}</div>

              <button
                className="btn btn-outline-success btn-sm w-100"
                onClick={() => openWhatsapp(a.mobile, getReminderMessage(a))}
              >
                Send Reminder
              </button>
            </div>
          ))}
        </div>

        <div className="table-responsive d-none d-md-block">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Patient</th>
                <th>Mobile</th>
                <th>Slot</th>
                <th>Type</th>
                <th width="160">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.name}</td>
                  <td>{a.mobile}</td>
                  <td>{a.slot}</td>
                  <td>{a.mode || "Offline"}</td>
                  <td>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => openWhatsapp(a.mobile, getReminderMessage(a))}
                    >
                      Send Reminder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
