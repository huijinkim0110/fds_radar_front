import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { getAllUsers, updateUserStatus } from "../../api/user/adminUserAPI";

const STATUS = {
  ACTIVE: { label: "정상", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
  SUSPENDED: { label: "정지", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
  LOCKED: { label: "잠금", color: "var(--amber)", bg: "rgba(217,119,6,0.12)" },
};

function formatJoinedDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export default function AdminProfile() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function fetchMembers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError("회원 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  // [D파트 담당자 수정] 관리자 계정 / 탈퇴 회원은 목록에서 제외
  const filtered = members
    .filter((m) => m.role !== "ADMIN" && m.status !== "WITHDRAWN")
    .filter((m) => m.name.includes(q) || m.email.includes(q));

  async function toggleStatus(userId, currentStatus) {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      setBusyId(userId);
      await updateUserStatus(userId, nextStatus);
      await fetchMembers();
    } catch (err) {
      alert("상태 변경에 실패했습니다: " + (err.response?.data?.message ?? err.message));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div>불러오는 중...</div>;

  return (
    <>
      <TopBar title="회원정보" crumb="관리자 / 내 정보" search={false} />

      <Panel title="내 프로필" sub="로그인 계정 정보">
        <div className="myinfo">
          <div className="myinfo-avatar">{user?.name?.[0] || "A"}</div>
          <div className="myinfo-body">
            <div className="myinfo-name">
              {user?.name || "관리자"}
              <span className="myinfo-role">{user?.role || "ADMIN"}</span>
            </div>
            <div className="myinfo-email">{user?.email || "-"}</div>
          </div>
        </div>

        <table className="hpd-table" style={{ marginTop: 20 }}>
          <tbody>
            <tr><th>이름</th><td>{user?.name || "-"}</td></tr>
            <tr><th>이메일</th><td>{user?.email || "-"}</td></tr>
            <tr><th>권한</th><td>{user?.role || "-"}</td></tr>
          </tbody>
        </table>
      </Panel>

      {/* [D파트 담당자 수정] "전체 회원" → 관리자/탈퇴 회원 제외된 일반 회원 목록 */}
      <Panel
        title="전체 회원"
        sub={`총 ${filtered.length}명`}
        style={{ marginTop: 16 }}
        right={
          <input
            className="member-search"
            placeholder="이름·이메일 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
      >
        {error ? (
          <div className="prod-empty">{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>이름</th><th>이메일</th><th>권한</th>
                <th>상태</th><th>가입일</th><th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>해당하는 회원이 없습니다.</td></tr>
              )}
              {filtered.map((m) => {
                const s = STATUS[m.status] ?? { label: m.status, color: "var(--muted)", bg: "transparent" };
                const isBusy = busyId === m.userId;
                return (
                  <tr key={m.userId}>
                    <td className="tx">#{m.userId}</td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td className="tx">{m.email}</td>
                    <td>
                      <span className="chip" style={{ color: "var(--blue)", background: "rgba(37,99,235,0.12)" }}>
                        {m.role}
                      </span>
                    </td>
                    <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                    <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{formatJoinedDate(m.createdAt)}</td>
                    <td>
                      {/* [D파트 담당자 수정] admin은 목록 자체에서 빠지므로 role 체크 불필요, LOCKED만 예외처리 */}
                      {m.status === "LOCKED" ? (
                        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>잠금 상태</span>
                      ) : (
                        <button
                          className={m.status === "ACTIVE" ? "minibtn warn" : "minibtn"}
                          disabled={isBusy}
                          onClick={() => toggleStatus(m.userId, m.status)}
                        >
                          {m.status === "ACTIVE" ? "정지" : "해제"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}