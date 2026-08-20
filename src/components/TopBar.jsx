export default function TopBar({ title, crumb, search = true }) {
  return (
    <div className="top">
      <div>
        <h1>{title}</h1>
        <div className="crumb">{crumb}</div>
      </div>
      <div className="top-r">
        {search && <div className="search">거래 검색…</div>}
        <div className="avatar" />
      </div>
    </div>
  );
}
