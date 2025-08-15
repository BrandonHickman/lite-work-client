import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workouts from "./pages/Workouts";
import CreateWorkout from "./pages/CreateWorkout";
import WorkoutSession from "./pages/WorkoutSession";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoutes";

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="container page-content">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/workouts" element={
            <ProtectedRoute><Workouts /></ProtectedRoute>
          } />
          <Route path="/workouts/create" element={
            <ProtectedRoute><CreateWorkout /></ProtectedRoute>
          } />
          <Route path="/workouts/:id" element={
            <ProtectedRoute><WorkoutSession /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="page-card"><h2>Profile</h2></div>
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </Router>
  );
}
