import { useEffect, useMemo, useState } from "react";
import TopBar from "../TopBar";
import Panel from "../Panel";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  readNotifications,
} from "../../api/user/notificationAPI";

export default function Notifications() {
  const { user } = useAuth();

  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // DB 알림 조회
  useEffect(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    async function loadNotifications() {
      try {
        setLoading(true);

        const data = await getNotifications(user.userId);

        setNotifications(data);
      } catch (error) {
        console.error("알림 조회 실패:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user?.userId]);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        getNotificationType(notification.notificationType) === filter
    );
  }, [filter, notifications]);

  // 알림 클릭 + 읽음 처리
  const toggleNotification = async (notification) => {
    const id = notification.id;

    setExpandedId((prev) => (prev === id ? null : id));

    // 이미 읽은 알림이면 펼치기만 실행
    if (notification.read) {
      return;
    }

    try {
      await readNotifications(user.userId, id);

      // 화면에서도 바로 읽음 상태로 변경
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  // 모두 읽음 처리
  const markAllRead = async () => {
    if (!user?.userId) return;

    const unreadNotifications = notifications.filter(
      (notification) => !notification.read
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          readNotifications(
            user.userId,
            notification.id
          )
        )
      );

      // 화면에서도 모두 읽음 상태로 변경
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("알림 전체 읽음 처리 실패:", error);
    }
  };

  const filterButtons = [
    { key: "all", label: "전체" },
    { key: "security", label: "보안 알림" },
    { key: "account", label: "계좌·카드" },
    { key: "service", label: "서비스" },
  ];

  return (
    <>
      <TopBar
        title="알림"
        crumb="홈 / 내 정보 / 알림"
        search={false}
      />

      {/* 상단 안내 배너 */}
      <div
        style={{
          marginBottom: "18px",
          borderRadius: "18px",
          padding: "26px 32px",
          background:
            "linear-gradient(135deg, #eef5ff 0%, #e4efff 100%)",
          border: "1px solid #dce8f8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "150px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#3478f6",
              marginBottom: "10px",
            }}
          >
            중요한 소식을 놓치지 마세요.
          </div>

          <div
            style={{
              fontSize: "25px",
              fontWeight: "800",
              lineHeight: "1.4",
              color: "#172033",
            }}
          >
            회원님의 금융 생활을
            <br />
            더 안전하게 지켜드립니다.
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "13px",
              color: "#6c7890",
            }}
          >
            계좌, 카드, 보안, 서비스 관련 주요 알림을 확인하세요.
          </div>
        </div>

        <div
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "28px",
            background: "rgba(52, 120, 246, 0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BellIcon />
        </div>
      </div>

      {/* 필터 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {filterButtons.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{
                border: "1px solid #dbe2ec",
                borderRadius: "999px",
                padding: "10px 17px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
                background:
                  filter === item.key
                    ? "#3478f6"
                    : "#ffffff",
                color:
                  filter === item.key
                    ? "#ffffff"
                    : "#48546a",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={markAllRead}
          style={{
            border: "1px solid #dbe2ec",
            background: "#ffffff",
            borderRadius: "999px",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "700",
            color: "#48546a",
          }}
        >
          ✓ 모두 읽음으로 표시
        </button>
      </div>

      {/* 알림 목록 */}
      <Panel>
        <div
          style={{
            overflow: "hidden",
            borderRadius: "12px",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "50px 0",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "13px",
              }}
            >
              알림을 불러오는 중입니다.
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div
              style={{
                padding: "50px 0",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "13px",
              }}
            >
              해당 알림이 없습니다.
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const id = notification.id;

              const type = getNotificationType(
                notification.notificationType
              );

              const isOpen = expandedId === id;

              return (
                <div
                  key={id}
                  style={{
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <div
                    onClick={() =>
                      toggleNotification(notification)
                    }
                    style={{
                      minHeight: "82px",
                      padding: "15px 18px",
                      display: "grid",
                      gridTemplateColumns:
                        "52px 1fr auto auto 28px",
                      gap: "14px",
                      alignItems: "center",
                      cursor: "pointer",
                      background: notification.read
                        ? "transparent"
                        : "rgba(52,120,246,0.035)",
                    }}
                  >
                    {/* 알림 종류 아이콘 */}
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        background: getIconBackground(type),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <NotificationIcon type={type} />
                    </div>

                    {/* 제목 / 내용 */}
                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--ink)",
                          marginBottom: "5px",
                        }}
                      >
                        {notification.title}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notification.content}
                      </div>
                    </div>

                    {/* 읽음 여부 */}
                    <span
                      style={{
                        padding: "5px 9px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: notification.read
                          ? "#f0f3f8"
                          : "#fff0f2",
                        color: notification.read
                          ? "#8893a6"
                          : "#f05268",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notification.read
                        ? "읽음"
                        : "읽지 않음"}
                    </span>

                    {/* 시간 */}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8893a6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(notification.createAt)}
                    </div>

                    {/* 펼치기 화살표 */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transform: isOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <ChevronDownIcon />
                    </div>
                  </div>

                  {/* 상세 내용 */}
                  {isOpen && (
                    <div
                      style={{
                        margin: "0 18px 16px 84px",
                        padding: "15px 18px",
                        background: "var(--panel2)",
                        borderRadius: "10px",
                        fontSize: "13px",
                        lineHeight: "1.7",
                        color: "var(--ink)",
                      }}
                    >
                      {notification.content}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Panel>
    </>
  );
}

/* =========================
   알림 데이터 처리
========================= */

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("ko-KR");
}

function getNotificationType(type) {
  if (!type) return "service";

  const value = String(type).toUpperCase();

  if (
    value.includes("FRAUD") ||
    value.includes("SECURITY") ||
    value.includes("LOGIN")
  ) {
    return "security";
  }

  if (
    value.includes("ACCOUNT") ||
    value.includes("CARD") ||
    value.includes("LOCK")
  ) {
    return "account";
  }

  return "service";
}

/* =========================
   아이콘
========================= */

function BellIcon() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
        stroke="#3478f6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 21h4"
        stroke="#3478f6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotificationIcon({ type }) {
  if (type === "security") {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"
          stroke="#f05268"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="#f05268"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "account") {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="10"
          width="14"
          height="10"
          rx="2"
          stroke="#3478f6"
          strokeWidth="1.8"
        />
        <path
          d="M8 10V7a4 4 0 0 1 8 0v3"
          stroke="#3478f6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "service") {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 13V9l11-4v12L4 13Z"
          stroke="#7657e8"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M7 14v4"
          stroke="#7657e8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M18 8.5 21 7"
          stroke="#7657e8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="m18 13.5 3 1.5"
          stroke="#7657e8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "card") {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="#20b486"
          strokeWidth="1.8"
        />
        <path
          d="M3 9h18"
          stroke="#20b486"
          strokeWidth="1.8"
        />
        <path
          d="M7 15h4"
          stroke="#20b486"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return <BellSmallIcon />;
}

function BellSmallIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9Z"
        stroke="#3478f6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21h4"
        stroke="#3478f6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="#667085"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getIconBackground(type) {
  switch (type) {
    case "security":
      return "#fff0f2";

    case "account":
      return "#edf4ff";

    case "service":
      return "#f2efff";

    case "card":
      return "#eafaf5";

    default:
      return "#edf4ff";
  }
}