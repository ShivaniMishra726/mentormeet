import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import MentorList from "./pages/MentorList";
import MentorDetail from "./pages/MentorDetail";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
       path="/mentors"
       element={
         <ProtectedRoute allowedRole="student">
           <MentorList />
         </ProtectedRoute>
       }
      />
      <Route
      path="/mentor/:mentorId"
      element={
         <ProtectedRoute allowedRole="student">
          <MentorDetail />
         </ProtectedRoute>
      }
      />
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute allowedRole="mentor">
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;