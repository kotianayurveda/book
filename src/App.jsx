import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import "./App.css";

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes />
    </>
  );
}
