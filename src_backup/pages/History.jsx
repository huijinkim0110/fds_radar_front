import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import TopBar from "../components/TopBar.jsx";
import TxTable from "../components/TxTable.jsx";
import Panel from "../components/Panel.jsx";

const TABS = ["전체", "정상", "검토중", "차단됨"];

export default function History() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("전체");

  useEffect(() => {
    api.getTransactions().then(setRows);
  }, []);

  const filtered = tab === "전체" ? rows : rows.filter((r) => r.status === tab);

  return (
    <>
      <TopBar title="거래 내역" crumb="홈 / 거래 내역" />
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <Panel>
        <TxTable rows={filtered} showKind />
        <div className="pager">
          <button>이전</button>
          <button className="on">1</button>
          <button>2</button>
          <button>다음</button>
        </div>
      </Panel>
    </>
  );
}