import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// 유저 메뉴
const USER_MENU = [
  { type: "single", path: "dashboard", label: "대시보드" },
  {
    type: "group", label: "계좌·카드",
    children: [
      { path: "accounts", label: "계좌 관리" },
      { path: "cards", label: "카드 관리" },
      { path: "transactions", label: "거래내역" },
    ],
  },
  {
    type: "group", label: "보안·신고",
    children: [
      { path: "fraud-confirmations", label: "이상거래 확인" },
      { path: "fraud-reports", label: "거래 신고" },
      { path: "disputes", label: "이의제기" },
      { path: "lock-requests", label: "계좌·카드 잠금 요청" },
    ],
  },
  {
    type: "group", label: "자산관리",
    children: [
      { path: "financial-profile", label: "재무 프로필" },
      { path: "favorites", label: "관심상품" },
      { path: "comparisons", label: "비교상품" },
    ],
  },
  {
    type: "group", label: "내 투자성향",
    children: [
      { path: "diagnosis/results", label: "진단 결과" },
      { path: "recommendations", label: "추천 상품" },
    ],
  },
  {
    type: "group", label: "내 정보",
    children: [
      { path: "profile", label: "회원정보" },
      { path: "devices", label: "로그인 기기·이력" },
      { path: "notifications", label: "알림" },
    ],
  },
];

// 관리자 메뉴
const ADMIN_MENU = [
  { type: "single", path: "dashboard", label: "관리자 대시보드" },
  {
    type: "group", label: "이상거래 관리",
    children: [
      { path: "admin-fraud-cases", label: "이상거래 사건" },
      { path: "admin-fraud-analysis", label: "이상거래 분석" },
    ],
  },
  {
    type: "group", label: "요청 처리",
    children: [
      { path: "admin-lock-requests", label: "잠금 요청 처리" },
      { path: "admin-disputes", label: "이의제기 심사" },
      { path: "admin-reports", label: "신고 처리" },
    ],
  },
  {
    type: "group", label: "상담",
    children: [
      { path: "admin-chats", label: "상담 관리" },
    ],
  },
  {
    type: "group", label: "내 정보",
    children: [
      { path: "profile", label: "회원정보" },
    ],
  },
];

function MyPageLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";
  const menu = isAdmin ? ADMIN_MENU : USER_MENU;

  return (
    <div className="mp-app">
      <aside className="mp-side">
        <div className="mp-brand" style={{ cursor: "pointer"}} onClick={() => navigate("/")}>
          <div className="mp-lg">W</div>
          <div>
            <b>Wonly</b>
            <span>{isAdmin ? "Admin Page" : "My Page"}</span>
          </div>
          <span className="mp-role">{isAdmin ? "ADMIN" : "USER"}</span>
        </div>

        <nav className="mp-nav">
          {menu.map((item) =>
            item.type === "single" ? (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) => (isActive ? "mp-link on" : "mp-link")}
              >
                <span className="mp-dot" />
                {item.label}
              </NavLink>
            ) : (
              <div className="mp-group" key={item.label}>
                <div className="mp-group-label">{item.label}</div>
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    end
                    className={({ isActive }) => (isActive ? "mp-link on" : "mp-link")}
                  >
                    <span className="mp-dot" />
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )
          )}
        </nav>
      </aside>

      <main className="mp-main">
        <Outlet />
      </main>
    </div>
  );
}

export default MyPageLayout;