// 거래 상태 뱃지. 상태 문자열에 따라 색 자동 매핑.
const MAP = {
  차단됨: "c-block",
  검토중: "c-review",
  환불완료: "c-pass",
  정상: "c-pass",
  신뢰됨: "c-pass",
};

export default function StatusChip({ status }) {
  return <span className={`chip ${MAP[status] || "c-pass"}`}>{status}</span>;
}
