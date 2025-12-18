import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAppointmentsByMobile } from "../api/appointmentsApi";

export default function Home() {
  const [mobile, setMobile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const m = getCookie("mobile");
    if (m) {
      setMobile(m);
      loadBookings(m);
    }
  }, []);

  const loadBookings = async (mobile) => {
    setLoading(true);
    const data = await getAppointmentsByMobile(mobile);
    setAppointments(data);
    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 text-center">
          <h1 className="display-4 mb-3">Doctor Appointment</h1>
          <p className="lead mb-4">Schedule your appointment with ease</p>

          <div className="d-grid gap-3 d-md-flex justify-content-md-center mb-5">
            <Link to="/book" className="btn btn-primary btn-lg px-4">
              Book Appointment
            </Link>
            
          </div>

          {/* 🔹 Past & Future Appointments */}
          {mobile && (
            <div className="card mt-4">
              <div className="card-header fw-bold">
                Your Upcoming Appointments
              </div>

              <div className="card-body">
                {loading && <p>Loading appointments...</p>}

                {!loading && appointments.length === 0 && (
                  <p className="text-muted">No upcoming appointments</p>
                )}

                {!loading && appointments.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Slot</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map(a => (
                          <tr key={a.appointmentId}>
                            <td>{a.date}</td>
                            <td>{a.slot}</td>
                            <td>
                              <span className={`badge ${
                                a.status === "Cancelled"
                                  ? "bg-danger"
                                  : a.status === "Rescheduled"
                                  ? "bg-warning text-dark"
                                  : "bg-success"
                              }`}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🔹 Cookie helper */
function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1];
}
