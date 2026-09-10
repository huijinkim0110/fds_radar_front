import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopBar({ title, crumb, search = true }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      {/* 왼쪽 제목 */}
      <div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "var(--muted)",
            marginTop: "4px",
          }}
        >
          {crumb}
        </div>
      </div>

      {/* 오른쪽 프로필 */}
      <div
        style={{
          position: "relative",
        }}
      >
        {/* 동그라미 프로필 버튼 */}
        <button
          onClick={() => setProfileOpen((prev) => !prev)}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "1px solid var(--line)",
            background: "var(--panel)",
            color: "var(--ink)",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "16px",
          }}
        >
          {user?.name?.charAt(0) || "U"}
        </button>

        {/* 프로필 메뉴 */}
        {profileOpen && (
          <div className="profile-dropdown">
            {/* 사용자 정보 */}
            <div className="profile-dropdown-user">
              <div className="profile-dropdown-name">
                {user?.name || "사용자"}
              </div>

              <div className="profile-dropdown-email">
                {user?.email || ""}
              </div>
            </div>

            {/* 회원정보 */}
            <button
              className="profile-dropdown-btn"
              onClick={() => {
                navigate("/mypage/profile");
                setProfileOpen(false);
              }}
            >
              <div className="profile-dropdown-content">
                <strong>회원정보</strong>
                <span>내 정보를 확인하고 관리할 수 있습니다.</span>
              </div>

              <span className="profile-dropdown-arrow">›</span>
            </button>

            {/* 알림 */}
            <button
              className="profile-dropdown-btn"
              onClick={() => {
                navigate("/mypage/notifications");
                setProfileOpen(false);
              }}
            >
              <div className="profile-dropdown-content">
                <strong>알림</strong>
                <span>새로운 알림과 주요 소식을 확인할 수 있습니다.</span>
              </div>

              <span className="profile-dropdown-arrow">›</span>
            </button>

            {/* 로그아웃 */}
            <button
              className="profile-dropdown-btn profile-dropdown-logout"
              onClick={() => {
                logout();
                setProfileOpen(false);
                navigate("/");
              }}
            >
              <div className="profile-dropdown-content">
                <strong>로그아웃</strong>
                <span>안전하게 계정을 로그아웃합니다.</span>
              </div>

              <span className="profile-dropdown-arrow">›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}