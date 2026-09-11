// 로그인 기기/이력 페이지
import { useEffect, useState } from "react";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { useAuth } from "../../context/AuthContext";
import {
  getUserDevices,
  getLoginHistories,
} from "../../api/user/deviceHistoryAPI.js";

export default function LoginDeviceHistory() {
  const { user } = useAuth();

  const [devices, setDevices] = useState([]);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 로그인 이력 페이지 번호
  const [currentPage, setCurrentPage] = useState(1);

  // 한 페이지에 보여줄 로그인 이력 개수
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    async function loadDeviceHistory() {
      try {
        setLoading(true);

        const [deviceData, historyData] = await Promise.all([
          getUserDevices(user.userId),
          getLoginHistories(user.userId),
        ]);

        setDevices(deviceData);
        setHistories(historyData);

        // 조회할 때 항상 첫 페이지부터
        setCurrentPage(1);
      } catch (error) {
        console.error("로그인 기기/이력 조회 실패:", error);

        setDevices([]);
        setHistories([]);
      } finally {
        setLoading(false);
      }
    }

    loadDeviceHistory();
  }, [user?.userId]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("ko-KR");
  };

  // 전체 페이지 수
  const totalPages = Math.ceil(
    histories.length / ITEMS_PER_PAGE
  );

  // 현재 페이지에서 보여줄 로그인 이력
  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex =
    startIndex + ITEMS_PER_PAGE;

  const currentHistories =
    histories.slice(startIndex, endIndex);

  // 페이지 이동
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  return (
    <>
      <TopBar
        title="로그인 기기 이력"
        crumb="홈 / 내 정보 / 로그인 기기 이력"
        search={false}
      />

      {/* 등록 기기 */}
      <Panel
        title="등록 기기"
        sub="내 계정에 등록된 기기를 확인할 수 있습니다."
      >
        {loading ? (
          <div
            style={{
              padding: "28px 0",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            불러오는 중입니다.
          </div>
        ) : devices.length === 0 ? (
          <div
            style={{
              padding: "28px 0",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            등록된 기기가 없습니다.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {devices.map((device) => (
              <div
                key={device.deviceId}
                style={{
                  padding: "16px",
                  border: "1px solid var(--line)",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {device.deviceName}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                  }}
                >
                  신뢰 기기:{" "}
                  {device.trusted ? "예" : "아니오"}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    marginTop: "4px",
                  }}
                >
                  차단 상태:{" "}
                  {device.blocked ? "차단됨" : "정상"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* 로그인 이력 */}
      <Panel
        title="로그인 이력"
        sub="최근 로그인 기록을 확인할 수 있습니다."
        style={{ marginTop: "16px" }}
      >
        {loading ? (
          <div
            style={{
              padding: "28px 0",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            불러오는 중입니다.
          </div>
        ) : histories.length === 0 ? (
          <div
            style={{
              padding: "28px 0",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            로그인 기록이 없습니다.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {currentHistories.map((history) => (
                <div
                  key={history.id}
                  style={{
                    padding: "16px",
                    border:
                      "1px solid var(--line)",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {history.deviceInfo}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: history.success
                          ? "var(--green)"
                          : "var(--red)",
                      }}
                    >
                      {history.success
                        ? "로그인 성공"
                        : "로그인 실패"}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    IP 주소:{" "}
                    {history.ipAddress || "-"}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    로그인 시간:{" "}
                    {formatDate(
                      history.createAt
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지 번호 */}
            {totalPages > 1 && (
              <div className="pager">
                <button
                  onClick={() =>
                    changePage(
                      currentPage - 1
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                >
                  이전
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "on"
                        : ""
                    }
                    onClick={() =>
                      changePage(page)
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    changePage(
                      currentPage + 1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </Panel>
    </>
  );
}