import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workouts from "./pages/Workouts";
import CreateWorkout from "./pages/CreateWorkout";
import WorkoutSession from "./pages/WorkoutSession";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="container page-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/create" element={<CreateWorkout />} />
          <Route path="/workouts/:id" element={<WorkoutSession />} />
          <Route path="/profile" element={<div className="page-card"><h2>Profile</h2></div>} />
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </Router>
  );
}
