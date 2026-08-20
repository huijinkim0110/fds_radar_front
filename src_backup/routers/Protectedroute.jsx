import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// 로그인/role 문지기.
// - 토큰 없음 → 로그인으로
// - 유저 정보 로딩 중(ready=false) → 잠깐 대기
// - role 안 맞음 → 본인 홈으로
export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("accessToken");
  const { user, ready } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (!ready) return <div className="loading">불러오는 중…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}