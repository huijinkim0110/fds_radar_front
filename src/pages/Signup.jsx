import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import AuthLayout from "../layouts/AuthLayout.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    birthDate: "",
    phoneNumber: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    // 간단 프론트 검증 (백엔드 규칙이랑 맞춤)
    if (form.password.length < 8) {
      return setErr("비밀번호는 8자 이상이어야 합니다.");
    }
    if (!/^\d{3}-\d{3,4}-\d{4}$/.test(form.phoneNumber)) {
      return setErr("전화번호는 010-1234-5678 형식으로 입력하세요.");
    }

    setLoading(true);
    try {
      await api.signup(form);
      alert("회원가입 완료! 로그인해주세요.");
      navigate("/login");
    } catch {
      setErr("회원가입에 실패했습니다. 입력값을 확인하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heading={<>지금 가입하고<br />내 계좌를 안전하게.</>}
      sub="몇 가지 정보만 입력하면 끝나요."
      stats={[
        { v: "97.8%", k: "탐지 정확도" },
        { v: "<0.3s", k: "실시간 판정" },
        { v: "24시간", k: "무중단 감시" },
      ]}
    >
      <h1>회원가입</h1>
      <div className="lead">계정을 만들어 시작하세요.</div>

      <form onSubmit={submit}>
        <div className="field">
          <label>이름</label>
          <input placeholder="홍길동" value={form.name}
            onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="field">
          <label>이메일</label>
          <input type="email" placeholder="name@company.com" value={form.email}
            onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input type="password" placeholder="8자 이상" value={form.password}
            onChange={(e) => set("password", e.target.value)} required />
        </div>
        <div className="field">
          <label>생년월일</label>
          <input type="date" value={form.birthDate}
            onChange={(e) => set("birthDate", e.target.value)} required />
        </div>
        <div className="field">
          <label>전화번호</label>
          <input placeholder="010-1234-5678" value={form.phoneNumber}
            onChange={(e) => set("phoneNumber", e.target.value)} required />
        </div>

        {err && <div className="form-err">{err}</div>}

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "가입 중…" : "회원가입"}
        </button>
      </form>

      <div className="swap">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </div>
    </AuthLayout>
  );
}