import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import AuthLayout from "../layouts/AuthLayout.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) {
      setErr("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      await api.signup({ name: form.name, email: form.email, password: form.password });
      alert("가입이 완료됐어요. 로그인해 주세요.");
      navigate("/login", { replace: true });
    } catch (e2) {
      setErr("가입에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heading={<>안전한 금융의<br />첫 걸음을 시작하세요.</>}
      sub="가입 즉시 이상거래 알림과 신고 기능을 사용할 수 있어요."
      stats={[
        { v: "실시간", k: "이상거래 알림" },
        { v: "1-Click", k: "거래 신고" },
      ]}
    >
      <h1>회원가입</h1>
      <div className="lead">기본 정보를 입력해 계정을 만드세요.</div>

      <form onSubmit={submit}>
        <div className="field">
          <label>이름</label>
          <input
            placeholder="홍길동"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>이메일</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="row2">
          <div className="field">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="8자 이상"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>비밀번호 확인</label>
            <input
              type="password"
              placeholder="재입력"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="rolehint">
          가입 계정은 <b>일반 사용자(USER)</b>로 생성됩니다. 관리자(ADMIN) 권한은 내부 승인 후 별도로 부여돼요.
        </div>

        {err && <div className="form-err">{err}</div>}

        <button className="primary" type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "가입 중…" : "가입하기"}
        </button>
      </form>

      <div className="swap">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </div>
    </AuthLayout>
  );
}