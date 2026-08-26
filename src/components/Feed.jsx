// 대시보드 우측 보안 알림용 피드
export function FeedItem({ color, t, m, time }) {
  return (
    <div className="fitem">
      <span className="fdot" style={{ background: color }} />
      <div>
        <div className="ft">{t}</div>
        <div className="fm">{m}</div>
      </div>
      <span className="ftime">{time}</span>
    </div>
  );
}

// 신고 현황 / 등록 기기용 카드
export function AlertCard({ color, t, m, right }) {
  return (
    <div className="acard">
      <div className="sev" style={{ background: color }} />
      <div>
        <div className="at">{t}</div>
        <div className="am">{m}</div>
      </div>
      <div className="aright">{right}</div>
    </div>
  );
}
