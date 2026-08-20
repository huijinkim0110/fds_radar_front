import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import TopBar from "../components/TopBar.jsx";
import KpiCard from "../components/KpiCard.jsx";
import TxTable from "../components/TxTable.jsx";
import Panel from "../components/Panel.jsx";
import { FeedItem } from "../components/Feed.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [txns, setTxns] = useState([]);

  useEffect(() => {
    api.getDashboard().then(setData);
    api.getTransactions().then((rows) => setTxns(rows.slice(0, 4)));
  }, []);

  if (!data) return <div className="loading">불러오는 중…</div>;

  return (
    <>
      <TopBar title="내 대시보드" crumb="홈 / 내 계좌 요약" />

      <div className="balance">
        <div>
          <div className="lbl">내 계좌 잔액</div>
          <div className="big">{data.balance}</div>
          <div style={{ marginTop: 12 }}>
            <span className="safe"><i />계정 보안 상태 · 안전</span>
          </div>
        </div>
        <button className="report-btn" onClick={() => navigate("/report")}>
          ＋ 이상거래 신고
        </button>
      </div>

      <div className="kpis">
        {data.kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      <div className="cols">
        <Panel title="내 최근 거래" sub="의심 거래는 자동 표시" right={<div className="filterpill">전체</div>}>
          <TxTable rows={txns} />
        </Panel>

        <Panel title="보안 알림" sub="내 계정 관련">
          <div className="feed">
            {data.alerts.map((a, i) => <FeedItem key={i} {...a} />)}
          </div>
        </Panel>
      </div>
    </>
  );
}
