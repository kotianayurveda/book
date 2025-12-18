import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <h1>Doctor Appointment</h1>
      <Link to="/book">Book Appointment</Link><br />
      <Link to="/status">Check Status</Link>
    </>
  );
}
