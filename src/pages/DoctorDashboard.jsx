import { useEffect, useState } from "react";
import { getAppointmentsByMobile, updateAppointmentStatus } from "../api/appointmentsApi";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getAppointmentsByMobile("").then(setAppointments);
  }, []);

  const handleCancel = async (id) => {
    await updateAppointmentStatus(id, "Cancelled", "Doctor unavailable");
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, status: "Cancelled" } : a
    ));
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Doctor Dashboard</h2>
      
      {appointments.length === 0 ? (
        <div className="alert alert-info">No appointments found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Patient Name</th>
                <th>Mobile</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.mobile}</td>
                  <td>{a.date}</td>
                  <td>{a.slot}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(a.id)}
                      disabled={a.status === "Cancelled"}
                    >
                      {a.status === "Cancelled" ? "Cancelled" : "Cancel"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
