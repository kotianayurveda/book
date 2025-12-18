import { useState } from "react";
import { getAppointmentsByMobile } from "../api/appointmentsApi";

export default function AppointmentStatus() {
  const [mobile, setMobile] = useState("");
  const [list, setList] = useState([]);

  const search = async () => {
    setList(await getAppointmentsByMobile(mobile));
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Check Appointment Status</h2>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input 
              type="tel"
              className="form-control" 
              placeholder="Enter Mobile Number" 
              onChange={e => setMobile(e.target.value)} 
            />
            <button className="btn btn-primary" onClick={search}>Search</button>
          </div>
        </div>
      </div>

      {list.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.slot}</td>
                  <td>
                    <span className={`badge ${
                      a.status === 'Confirmed' ? 'bg-success' : 
                      a.status === 'Cancelled' ? 'bg-danger' : 
                      'bg-warning text-dark'
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

      {list.length === 0 && mobile && (
        <div className="alert alert-info">No appointments found for this mobile number.</div>
      )}
    </div>
  );
}
