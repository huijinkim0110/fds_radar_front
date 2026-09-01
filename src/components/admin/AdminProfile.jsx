import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

const MOCK_MEMBERS = [
  { id: 1, name: "김유저", email: "user1@test.com", role: "USER", status: "ACTIVE", joined: "2026-08-20" },
  { id: 2, name: "이고객", email: "user2@naver.com", role: "USER", status: "ACTIVE", joined: "2026-08-22" },
  { id: 3, name: "박회원", email: "user3@gmail.com", role: "USER", status: "LOCKED", joined: "2026-08-25" },
  { id: 4, name: "최관리", email: "admin@test.com", role: "ADMIN", status: "ACTIVE", joined: "2026-08-18" },
  { id: 5, name: "정신규", email: "user5@daum.net", role: "USER", status: "ACTIVE", joined: "2026-08-30" },
];

const STATUS = {
  ACTIVE: { label: "정상", color: "var(--green)", bg: "rgba(5,150,105,0.12)" },
  LOCKED: { label: "정지", color: "var(--red)", bg: "rgba(220,38,38,0.12)" },
};

export default function AdminProfile() {
  const { user } = useAuth();
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [q, setQ] = useState("");

  const filtered = members.filter((m) => m.name.includes(q) || m.email.includes(q));

  function toggleStatus(id) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: m.status === "ACTIVE" ? "LOCKED" : "ACTIVE" } : m))
    );
  }

  return (
    <>
      <TopBar title="회원정보" crumb="관리자 / 내 정보" search={false} />

      {/* 내 프로필 (본인 정보) */}
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

      {/* 전체 회원 목록 */}
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
        <table>
          <thead>
            <tr>
              <th>ID</th><th>이름</th><th>이메일</th><th>권한</th>
              <th>상태</th><th>가입일</th><th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const s = STATUS[m.status];
              return (
                <tr key={m.id}>
                  <td className="tx">#{m.id}</td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td className="tx">{m.email}</td>
                  <td>
                    <span className="chip" style={{
                      color: m.role === "ADMIN" ? "#7C3AED" : "var(--blue)",
                      background: m.role === "ADMIN" ? "rgba(124,58,237,0.12)" : "rgba(37,99,235,0.12)"
                    }}>{m.role}</span>
                  </td>
                  <td><span className="chip" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)" }}>{m.joined}</td>
                  <td>
                    {m.role !== "ADMIN" ? (
                      <button
                        className={m.status === "ACTIVE" ? "minibtn warn" : "minibtn"}
                        onClick={() => toggleStatus(m.id)}
                      >
                        {m.status === "ACTIVE" ? "정지" : "해제"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11.5, color: "var(--muted)" }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}