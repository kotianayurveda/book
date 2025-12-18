import { useEffect, useState } from "react";
import { getAppointmentsByMobile, updateAppointmentStatus } from "../api/appointmentsApi";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getAppointmentsByMobile("").then(setAppointments); // load all
  }, []);

  return (
    <>
      <h2>Doctor Dashboard</h2>
      {appointments.map(a => (
        <div key={a.id}>
          {a.name} | {a.mobile} | {a.date} | {a.slot}
          <button onClick={() => updateAppointmentStatus(a.id, "Cancelled", "Doctor unavailable")}>
            Cancel
          </button>
        </div>
      ))}
    </>
  );
}
