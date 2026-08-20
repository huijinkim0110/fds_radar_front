export default function KpiCard({ k, v, d, dir, pct, color }) {
    return (
        <div className="kpi">
            <div className="k">{k}</div>
            <div className="v">{v}</div>
            <div className={`d ${dir}`}>{d}</div>
            <div className="bar"><span style={{ width: `${pct}%`, background: color }} /></div>
        </div>
    );
}