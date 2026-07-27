import { Routes, Route } from "react-router-dom";
import BookAppointment from "../pages/BookAppointment";
import AppointmentStatus from "../pages/AppointmentStatus";
import DoctorDashboard from "../pages/DoctorDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DoctorDashboard />} />
      <Route path="/book" element={<BookAppointment />} />
      <Route path="/status" element={<AppointmentStatus />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
    </Routes>
  );
}
