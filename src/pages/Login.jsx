import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // 지금은 백엔드 로그인 연동 전이라 일단 홈이나 상품페이지로 이동
      // 나중에 팀 로그인 API 붙이면 여기서 호출
      alert("로그인 시도: " + form.email);
      navigate("/");   // home으로 이동
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
        <div className="field">
          <label>비밀번호</label>
          <input type="password" placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
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