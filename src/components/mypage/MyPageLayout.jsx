import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { connectAdminChatSocket, disconnectChatSocket } from "../../api/chat/chatSocket";
import { getSessions } from "../../api/chat/adminChatAPI";

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
      { path: "lock-requests", label: "계좌·카드 잠금 요청" },
    ],
  },
  {
    type: "group", label: "자산관리",
    children: [
      { path: "financial-profile", label: "재무 프로필" },
      { path: "financial-goals", label: "재무 목표"},
      { path: "favorites", label: "관심상품" },
      { path: "comparisons", label: "비교상품" },
      { path: "portfolio", label: "모의가입 상품" },
    ],
  },
  {
    type: "group", label: "내 투자성향",
    children: [
      { path: "diagnosis/results", label: "투자성향 진단·추천" },
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
  const location = useLocation();
  const { showToast } = useToast();
  const isAdmin = user?.role === "ADMIN";
  const adminId = user?.userId;
  const menu = isAdmin ? ADMIN_MENU : USER_MENU;

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  function refreshUnreadChatCount() {
    getSessions(["WAITING", "IN_PROGRESS"], adminId)
      .then((sessions) => {
        const count = sessions.filter((s) => s.status === "WAITING" || s.adminUnread).length;
        setUnreadChatCount(count);
      })
      .catch(() => {});
  }

  // 소켓 연결 - 새 상담 요청/메시지 이벤트마다 배지 + 토스트 갱신
  useEffect(() => {
    if (!isAdmin) return;

    refreshUnreadChatCount();

    const socket = connectAdminChatSocket(() => {
      refreshUnreadChatCount();
      showToast("새로운 상담 요청이 있습니다.", () => navigate("admin-chats"), undefined, 5000);
    });

    return () => disconnectChatSocket(socket);
  }, [isAdmin, adminId]);

  // 페이지 이동할 때마다 다시 세서, 상담방에서 읽고 나온 경우 등을 반영
  useEffect(() => {
    if (!isAdmin) return;
    refreshUnreadChatCount();
  }, [isAdmin, location.pathname]);

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
                    {child.path === "admin-chats" && unreadChatCount > 0 && (
                      <span
                        style={{
                          marginLeft: "auto", background: "var(--red)", color: "#fff",
                          borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: "bold",
                        }}
                      >
                        {unreadChatCount}
                      </span>
                    )}
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