import StatusChip from "./StatusChip.jsx";

export default function TxTable({ rows, showKind = false }) {
  return (
    <table>
      <thead>
        <tr>
          <th>일시</th>
          <th>내용</th>
          {showKind && <th>구분</th>}
          <th>금액</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="tx">{r.time}</td>
            <td>{r.name}</td>
            {showKind && <td>{r.kind}</td>}
            <td className="amt">{r.amt}</td>
            <td>
              <StatusChip status={r.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
