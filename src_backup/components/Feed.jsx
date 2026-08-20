export function FeedItem({ color, t, m, time }) {
  return (
    <div className="fitem">
      <span className="fdot" style={{ background: color }} />
      <div><div className="ft">{t}</div><div className="fm">{m}</div></div>
      <span className="ftime">{time}</span>
    </div>
  );
}
export function AlertCard({ color, t, m, right }) {
  return (
    <div className="acard">
      <div className="sev" style={{ background: color }} />
      <div><div className="at">{t}</div><div className="am">{m}</div></div>
      <div className="aright">{right}</div>
    </div>
  );
}