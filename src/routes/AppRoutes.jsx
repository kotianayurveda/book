import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import BookAppointment from "../pages/BookAppointment";
import AppointmentStatus from "../pages/AppointmentStatus";
import DoctorDashboard from "../pages/DoctorDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/book" element={<BookAppointment />} />
      <Route path="/status" element={<AppointmentStatus />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
    </Routes>
  );
}
