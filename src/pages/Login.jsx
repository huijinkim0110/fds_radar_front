import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 비밀번호 표시 여부
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await login({ email: form.email, password: form.password });
      navigate("/");
    } catch {
      setErr("이메일 또는 비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heading={<>실시간으로 이상거래를<br />탐지하고 차단합니다.</>}
      sub="계정으로 접속해 대시보드를 확인하세요."
      stats={[
        { v: "97.8%", k: "탐지 정확도" },
        { v: "<0.3s", k: "실시간 판정" },
        { v: "24시간", k: "무중단 감시" },
      ]}
    >
      <h1>로그인</h1>
      <div className="lead">Wonly에 오신 걸 환영합니다.</div>

      <form onSubmit={submit}>
        <div className="field">
          <label>이메일</label>
          <input type="email" placeholder="name@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>

        {/* 비밀번호 필드 영역 */}
        <div className="field">
          <label>비밀번호</label>
          <div className="password-wrapper" style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
              style={{ width: "100%", paddingRight: "40px" }} // 버튼 공간 확보
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: "#666"
              }}
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          </div>
        </div>

        {err && <div className="form-err">{err}</div>}

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <div className="swap">
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </div>
    </AuthLayout>
  );
}