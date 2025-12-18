import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Doctor Appointment</h1>
          <p className="lead mb-5">Schedule your appointment with ease</p>
          
          <div className="d-grid gap-3 d-md-flex justify-content-md-center">
            <Link to="/book" className="btn btn-primary btn-lg px-4">
              Book Appointment
            </Link>
            <Link to="/status" className="btn btn-outline-secondary btn-lg px-4">
              Check Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
