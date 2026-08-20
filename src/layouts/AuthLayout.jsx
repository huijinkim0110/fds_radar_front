// 로그인/회원가입 공용 껍데기. 좌측 브랜드 패널 + 우측에 폼(children).
export default function AuthLayout({ heading, sub, stats, children }) {
  return (
    <div className="auth">
      <div className="auth-brand">
        <div className="logo">
          <div className="mark">P</div>
          <b>파수</b>
        </div>
        <div>
          <h2>{heading}</h2>
          {sub && <p>{sub}</p>}
          {stats && (
            <div className="auth-stats">
              {stats.map((s, i) => (
                <div key={i}>
                  <b>{s.v}</b>
                  <span>{s.k}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="auth-form">
        <div className="form-box">{children}</div>
      </div>
    </div>
  );
}
