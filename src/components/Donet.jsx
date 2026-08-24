// 보안 점수 도넛. value(0~100)만큼 초록으로 채우고 나머진 회색.
// color로 채움 색 바꿀 수 있음 (기본 초록).
export default function Donut({ value, label = "안전", color = "var(--green)" }) {
  return (
    <div
      className="donut"
      style={{ background: `conic-gradient(${color} 0 ${value}%, #242F49 ${value}% 100%)` }}
    >
      <div className="hole">
        <b>{value}</b>
        <small>{label}</small>
      </div>
    </div>
  );
}