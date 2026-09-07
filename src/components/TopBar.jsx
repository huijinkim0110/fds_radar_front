import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopBar({ title, crumb, search = true, }) {
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
        {/* 동그라미 */}
        <button
          onClick={() => setProfileOpen((prev) => !prev)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid var(--line)",
            background: "var(--panel)",
            color: "var(--ink)",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          {user?.name?.charAt(0) || "U"}
        </button>

        {/* 프로필 메뉴 */}
        {profileOpen && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "0",
              width: "210px",
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "10px",
              padding: "8px",
              zIndex: 1000,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            {/* 로그인 사용자 정보 */}
            <div
              style={{
                padding: "10px",
                borderBottom: "1px solid var(--line)",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                {user?.name || "사용자"}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  marginTop: "4px",
                  wordBreak: "break-all",
                }}
              >
                {user?.email || ""}
              </div>
            </div>

            {/* 회원정보 */}
            <button
              className="minibtn"
              style={{
                width: "100%",
                marginBottom: "6px",
              }}
              onClick={() => {
                navigate("/mypage/profile");
                setProfileOpen(false);
              }}
            >
              회원정보
            </button>

            {/* 로그인 기기 이력 */}
            <button
              className="minibtn"
              style={{
                width: "100%",
                marginBottom: "6px",
              }}
              onClick={() => {
                navigate("/mypage/devices");
                setProfileOpen(false);
              }}
            >

              로그인 기기 이력
            </button>

            {/* 알림 */}
            <button
              className="minibtn"
              style={{
                width: "100%",
                marginBottom: "6px",
              }}
              onClick={() => {
                navigate("/mypage/notifications");
                setProfileOpen(false);
              }}
            >
              알림
            </button>

            {/* 로그아웃 */}
            <button
              className="minibtn"
              style={{
                width: "100%",
              }}
              onClick={() => {
                logout();
                setProfileOpen(false);
                navigate("/");
              }}
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}