import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MENU = [
  { to: "/dashboard", label: "내 대시보드" },
  { to: "/history", label: "거래 내역" },
  { to: "/report", label: "이상거래 신고" },
  { to: "/cards", label: "카드·계좌" },
  { to: "/security", label: "보안 설정" },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="side">
      <div className="brand">
        <div className="lg">P</div>
        <div>
          <b>파수</b>
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
        {user ? `${user.name} 님 · 로그인 중` : "로그인 필요"}
      </div>
    </aside>
  );
}
