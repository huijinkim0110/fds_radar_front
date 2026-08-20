// 카드 박스 껍데기. 제목(title)·부제(sub)·우측 요소(right)를 옵션으로 받음.
// 페이지마다 반복되던 <div className="panel"> + ph-head 구조를 하나로 묶음.
export default function Panel({ title, sub, right, children, style }) {
  return (
    <div className="panel" style={style}>
      {(title || right) && (
        <div className="ph-head">
          <div>
            {title && <h3>{title}</h3>}
            {sub && <div className="ph-sub">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {/* 제목 없이 sub만 있는 경우도 지원 */}
      {!title && sub && <div className="ph-sub">{sub}</div>}
      {children}
    </div>
  );
}
