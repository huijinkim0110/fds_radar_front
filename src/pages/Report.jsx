import { useEffect, useState } from "react";
import { api } from "../api/client.js"; // 상위 폴더 구조에 맞게 경로 조정
import TopBar from "../components/TopBar.jsx";
import Panel from "../components/Panel.jsx";
import StatusChip from "../components/StatusChip.jsx";
import { AlertCard } from "../components/Feed.jsx";

export default function Report() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ txn: "", type: "본인 결제가 아님", detail: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getReports?.().then(setReports).catch(() => {
      // API가 아직 구현되지 않은 경우를 대비한 더미 데이터 대안
      setReports([
        { color: "var(--amber)", t: "해외 결제 이의제기", m: "08-06 09:11 · ₩540,000", status: "처리중" }
      ]);
    });
  }, []);

  async function submit() {
    setSending(true);
    try {
      if (api.submitReport) {
        await api.submitReport(form);
      }
      alert("신고가 접수되었습니다.");
      setForm({ txn: "", type: "본인 결제가 아님", detail: "" });
      
      // 목록 다시 불러오기
      if (api.getReports) {
        const updated = await api.getReports();
        setReports(updated);
      }
    } catch (e) {
      alert("접수 실패: " + (e.message || "오류가 발생했습니다."));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <TopBar title="이상거래 신고" crumb="홈 / 신고" search={false} />
      <div className="cols">
        <Panel title="신고 접수" sub="본인이 하지 않은 거래를 신고하세요">
          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>대상 거래</label>
            <select 
              value={form.txn} 
              onChange={(e) => setForm({ ...form, txn: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}
            >
              <option value="">거래를 선택하세요</option>
              <option>08-05 23:47 · 알 수 없는 가맹점 · ₩890,000</option>
              <option>08-06 09:11 · 온라인 결제(해외) · ₩540,000</option>
            </select>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>신고 유형</label>
            <select 
              value={form.type} 
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}
            >
              <option>본인 결제가 아님</option>
              <option>이중 청구됨</option>
              <option>금액이 다름</option>
              <option>차단 이의제기</option>
            </select>
          </div>

          <div className="field" style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)" }}>상세 내용</label>
            <textarea
              placeholder="어떤 점이 이상한지 적어주세요."
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              style={{ width: "100%", height: 100, padding: "10px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#fff", resize: "vertical" }}
            />
          </div>

          <button 
            className="primary" 
            onClick={submit} 
            disabled={sending}
            style={{ width: "100%", padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
          >
            {sending ? "제출 중…" : "신고 제출"}
          </button>
        </Panel>

        <Panel title="내 신고 현황" sub="최근 접수">
          <div className="alist" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reports.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 14, padding: "10px 0" }}>접수된 신고 내역이 없습니다.</div>
            ) : (
              reports.map((r, i) => (
                <AlertCard key={i} color={r.color} t={r.t} m={r.m} right={<StatusChip status={r.status} />} />
              ))
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}