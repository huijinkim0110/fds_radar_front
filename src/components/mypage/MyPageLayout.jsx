import { NavLink, Outlet } from "react-router-dom";

const MENU_GROUPS = [
  { type: "single", path: "dashboard", label: "대시보드" },
  {
    type: "group",
    label: "계좌·카드",
    children: [
      { path: "accounts", label: "계좌 관리" },
      { path: "cards", label: "카드 관리" },
      { path: "transactions", label: "거래내역" },
    ],
  },
  {
    type: "group",
    label: "보안·신고",
    children: [
      { path: "fraud-confirmations", label: "이상거래 확인" },
      { path: "fraud-reports", label: "거래 신고" },
      { path: "disputes", label: "이의제기" },
      { path: "lock-requests", label: "계좌·카드 잠금 요청" },
    ],
  },
  {
    type: "group",
    label: "자산관리",
    children: [
      { path: "financial-profile", label: "재무 프로필" },
      { path: "favorites", label: "관심상품" },
      { path: "comparisons", label: "비교상품" },
    ],
  },
  {
    type: "group",
    label: "내 투자성향",
    children: [
      { path: "diagnosis", label: "투자성향 진단" },
      { path: "diagnosis/results", label: "진단 결과" },
      { path: "recommendations", label: "추천 상품" },
    ],
  },
  {
    type: "group",
    label: "내 정보",
    children: [
      { path: "profile", label: "회원정보" },
      { path: "devices", label: "로그인 기기·이력" },
      { path: "notifications", label: "알림" },
    ],
  },
];

function MyPageLayout() {
  return (
    <div className="mp-app">
      <aside className="mp-side">
        <div className="mp-brand">
          <div className="mp-lg">P</div>
          <div>
            <b>Wonly</b>
            <span>My Page</span>
          </div>
          <span className="mp-role">USER</span>
        </div>

        <nav className="mp-nav">
          {MENU_GROUPS.map((item) =>
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