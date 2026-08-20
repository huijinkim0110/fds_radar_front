import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import TopBar from "../components/TopBar.jsx";
import Panel from "../components/Panel.jsx";
import Toggle from "../components/Toggle.jsx";
import StatusChip from "../components/StatusChip.jsx";
import Donut from "../components/Donut.jsx";
import { AlertCard } from "../components/Feed.jsx";

export default function Security() {
  const [sec, setSec] = useState(null);

  useEffect(() => {
    api.getSecurity().then(setSec);
  }, []);

  function flip(key) {
    const next = { ...sec, toggles: { ...sec.toggles, [key]: !sec.toggles[key] } };
    setSec(next);
    api.updateSecurity(next.toggles); // 서버에 저장
  }

  if (!sec) return <div className="loading">불러오는 중…</div>;

  const rows = [
    { key: "twofa", st: "2단계 인증(2FA)", sm: "로그인 시 추가 인증" },
    { key: "alert", st: "이상거래 실시간 알림", sm: "푸시·문자로 즉시 통보" },
    { key: "oversea", st: "해외 결제 차단", sm: "해외 IP 결제 자동 차단" },
  ];

  return (
    <>
      <TopBar title="보안 설정" crumb="홈 / 보안" search={false} />
      <div className="cols">
        <Panel title="계정 보안" sub="권장 조치 1건">
          {rows.map((r) => (
            <div className="setrow" key={r.key}>
              <div><div className="st">{r.st}</div><div className="sm">{r.sm}</div></div>
              <Toggle on={sec.toggles[r.key]} onClick={() => flip(r.key)} />
            </div>
          ))}
          <div className="setrow">
            <div><div className="st">비밀번호</div><div className="sm">90일 이상 미변경 · 변경 권장</div></div>
            <button className="minibtn warn">변경</button>
          </div>
        </Panel>

        <Panel title="등록 기기" sub={`${sec.devices.length}대 · 낯선 기기는 해제하세요`}>
          <div className="alist">
            {sec.devices.map((d, i) => (
              <AlertCard
                key={i}
                color={d.color}
                t={d.t}
                m={d.m}
                right={d.trusted ? <StatusChip status="신뢰됨" /> : <button className="minibtn warn">해제</button>}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
            <Donut value={sec.score} />
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
              보안 점수 <b style={{ color: "var(--green)" }}>{sec.score} / 100</b><br />
              비밀번호만 바꾸면 <b style={{ color: "var(--blue)" }}>90+</b> 가능
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}