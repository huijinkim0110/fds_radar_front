import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./router/ProtectedRoute.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Report from "./pages/Report.jsx";
import Cards from "./pages/Cards.jsx";
import Security from "./pages/Security.jsx";

export default function App() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 유저 영역: 로그인 + USER role 이어야 통과 */}
      <Route
        element={
          <ProtectedRoute role="USER">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/report" element={<Report />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/security" element={<Security />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}