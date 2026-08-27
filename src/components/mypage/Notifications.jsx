// 알림 페이지
import { useMemo, useState } from "react";
import TopBar from "../TopBar";
import Panel from "../Panel";

export default function notifications() {
    const [filter, setFilter] = useState("all");

    const [notifications, setNotifications] = useState([
        {
           notificationId: 1,
      title: "이상거래 감지",
      content: "의심스러운 거래가 감지되었습니다.",
      createdAt: "2026-08-27 13:20",
      read: false,
    },
    {
      notificationId: 2,
      title: "로그인 알림",
      content: "새로운 기기에서 로그인이 확인되었습니다.",
      createdAt: "2026-08-26 18:30",
      read: true,
    },
    {
      notificationId: 3,
      title: "보안 알림",
      content: "계정 보안 상태를 확인해주세요.",
      createdAt: "2026-08-25 09:10",
      read: false,
    },
  ]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  return (
    <>
      <TopBar
        title="알림"
        crumb="홈 / 내 정보 / 알림"
        search={false}
      />

      <Panel
        title="내 알림"
        sub={`읽지 않은 알림 ${unreadCount}개`}
        right={
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              className="minibtn"
              onClick={() => setFilter("all")}
              style={{
                background:
                  filter === "all" ? "var(--blue)" : "var(--panel2)",
                color: filter === "all" ? "#fff" : "var(--ink)",
                borderColor:
                  filter === "all" ? "var(--blue)" : "var(--line)",
              }}
            >
              전체
            </button>

            <button
              type="button"
              className="minibtn"
              onClick={() => setFilter("unread")}
              style={{
                background:
                  filter === "unread" ? "var(--blue)" : "var(--panel2)",
                color: filter === "unread" ? "#fff" : "var(--ink)",
                borderColor:
                  filter === "unread" ? "var(--blue)" : "var(--line)",
              }}
            >
              읽지 않음
            </button>
          </div>
        }
      >
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              padding: "36px 0",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            표시할 알림이 없습니다.
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.notificationId}
                onClick={() => handleRead(notification.notificationId)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  padding: "18px 4px",
                  borderBottom: "1px solid var(--line)",
                  cursor: "pointer",
                  opacity: notification.read ? 0.65 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      marginTop: "7px",
                      background: notification.read
                        ? "var(--muted)"
                        : "var(--blue)",
                      flexShrink: 0,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: notification.read ? "500" : "700",
                        color: "var(--ink)",
                        marginBottom: "6px",
                      }}
                    >
                      {notification.title}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--muted)",
                        marginBottom: "7px",
                      }}
                    >
                      {notification.content}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                      }}
                    >
                      {notification.createdAt}
                    </div>
                  </div>
                </div>

                <span
                  className="filterpill"
                  style={{
                    whiteSpace: "nowrap",
                    color: notification.read
                      ? "var(--muted)"
                      : "var(--blue)",
                  }}
                >
                  {notification.read ? "읽음" : "읽지 않음"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}