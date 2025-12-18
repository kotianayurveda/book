import { useState } from "react";
import { getAppointmentsByMobile } from "../api/appointmentsApi";

export default function AppointmentStatus() {
  const [mobile, setMobile] = useState("");
  const [list, setList] = useState([]);

  const search = async () => {
    setList(await getAppointmentsByMobile(mobile));
  };

  return (
    <>
      <input placeholder="Mobile Number" onChange={e => setMobile(e.target.value)} />
      <button onClick={search}>Search</button>

      {list.map(a => (
        <div key={a.id}>
          {a.date} | {a.slot} | {a.status}
        </div>
      ))}
    </>
  );
}
