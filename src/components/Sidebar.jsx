import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MENU = [
  { to: "/dashboard", label: "내 대시보드" },
  { to: "/history", label: "거래 내역" },
  { to: "/report", label: "이상거래 신고" },
  { to: "/cards", label: "카드·계좌" },
  { to: "/security", label: "보안 설정" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();   
  const navigate = useNavigate();

  function handleLogout() {
    logout();                 // 토큰 삭제 + 유저 비움
    navigate("/login", { replace: true });   // 로그인으로 이동
  }

  return (
    <aside className="side">
      <div className="brand">
        <div className="lg">P</div>
        <div>
          <b>Wonly</b>
          <span>My Account</span>
        </div>
        <span className="roletag">{user?.role ?? "USER"}</span>
      </div>

      <nav className="nav">
        {MENU.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) => (isActive ? "nav-link on" : "nav-link")}
          >
            <span className="dot" />
            {m.label}
          </NavLink>
        ))}
      </nav>

      <div className="side-foot">
        <div>{user ? `${user.name} 님` : "로그인 필요"}</div>
        <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
      </div>
    </aside>
  );
}