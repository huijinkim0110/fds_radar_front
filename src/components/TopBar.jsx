import { useNavigate } from "react-router-dom";

export default function TopBar({ title, crumb, search = true, back = true }) {
  const navigate = useNavigate();

  return (
    <div className="top">
      <div className="top-l">
        {back && (
          <button className="topbar-back" onClick={() => navigate(-1)}>
            ← 뒤로
          </button>
        )}
        <div>
          <h1>{title}</h1>
          <div className="crumb">{crumb}</div>
        </div>
      </div>
      <div className="top-r">
        {search && <div className="search">거래 검색…</div>}
        <div className="avatar" />
      </div>
    </div>
  );
}