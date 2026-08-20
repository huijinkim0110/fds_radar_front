import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import TopBar from "../components/TopBar.jsx";
import Panel from "../components/Panel.jsx";
import StatusChip from "../components/StatusChip.jsx";
import { AlertCard } from "../components/Feed.jsx";

export default function Report() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ txn: "", type: "본인 결제가 아님", detail: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getReports().then(setReports);
  }, []);

  async function submit() {
    setSending(true);
    try {
      await api.submitReport(form);
      alert("신고가 접수되었습니다.");
      setForm({ ...form, detail: "" });
      api.getReports().then(setReports);
    } catch (e) {
      alert("접수 실패: " + e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <TopBar title="이상거래 신고" crumb="홈 / 신고" search={false} />
      <div className="cols">
        <Panel title="신고 접수" sub="본인이 하지 않은 거래를 신고하세요">
          <div className="field">
            <label>대상 거래</label>
            <select value={form.txn} onChange={(e) => setForm({ ...form, txn: e.target.value })}>
              <option>08-05 23:47 · 알 수 없는 가맹점 · ₩890,000</option>
              <option>08-06 09:11 · 온라인 결제(해외) · ₩540,000</option>
            </select>
          </div>

          <div className="field">
            <label>신고 유형</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>본인 결제가 아님</option>
              <option>이중 청구됨</option>
              <option>금액이 다름</option>
              <option>차단 이의제기</option>
            </select>
          </div>

          <div className="field">
            <label>상세 내용</label>
            <textarea
              placeholder="어떤 점이 이상한지 적어주세요."
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
          </div>

          <button className="primary" onClick={submit} disabled={sending}>
            {sending ? "제출 중…" : "신고 제출"}
          </button>
        </Panel>

        <Panel title="내 신고 현황" sub="최근 접수">
          <div className="alist">
            {reports.map((r, i) => (
              <AlertCard key={i} color={r.color} t={r.t} m={r.m} right={<StatusChip status={r.status} />} />
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
