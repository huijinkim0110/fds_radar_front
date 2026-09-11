import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";

export default function FindPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [emailVerified, setEmailVerified] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // 이메일 인증
  async function handleEmailCheck() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setCheckingEmail(true);

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      if (data.exists) {
        setEmailVerified(true);
        setError("");
      } else {
        setEmailVerified(false);
        setError("가입된 이메일이 아닙니다.");
      }
    } catch (err) {
      setEmailVerified(false);
      setError("이메일 확인 중 오류가 발생했습니다.");
    } finally {
      setCheckingEmail(false);
    }
  }

  // 이메일 수정 시 인증 초기화
  function handleEmailChange(e) {
    setEmail(e.target.value);

    setEmailVerified(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setMessage("");
  }

  // 비밀번호 변경 버튼 활성화 조건
  const canChangePassword =
    emailVerified &&
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    newPassword === confirmPassword;

  // 비밀번호 변경
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!emailVerified) {
      setError("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationType: "EMAIL",
          verificationValue: email,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setMessage("비밀번호가 변경되었습니다.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError("비밀번호 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heading={
        <>
          비밀번호를
          <br />
          다시 설정합니다.
        </>
      }
      sub="가입한 이메일을 확인한 후 새로운 비밀번호를 설정하세요."
    >
      <h1>비밀번호 찾기</h1>

      <div className="lead">
        가입할 때 사용한 이메일을 입력해주세요.
      </div>

      <form onSubmit={handleSubmit}>
        {/* 이메일 */}
        <div className="field">
          <label>이메일</label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={handleEmailChange}
              disabled={emailVerified}
              required
              style={{
                flex: 1,
              }}
            />

            {emailVerified && (
              <span
                style={{
                  whiteSpace: "nowrap",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                ✓ 인증 완료
              </span>
            )}
          </div>
        </div>

        {/* 이메일 인증 버튼 */}
        {!emailVerified && (
          <button
            type="button"
            className="primary"
            onClick={handleEmailCheck}
            disabled={checkingEmail || !email.trim()}
            style={{
              marginBottom: "20px",
              width: "100%",
            }}
          >
            {checkingEmail ? "확인 중..." : "이메일 인증"}
          </button>
        )}

        {/* 새 비밀번호 */}
        <div className="field">
          <label>새 비밀번호</label>

          <div
            style={{
              position: "relative",
            }}
          >
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder={
                emailVerified
                  ? "8자 이상 입력해주세요."
                  : "이메일 인증 후 입력할 수 있습니다."
              }
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!emailVerified}
              required
              style={{
                width: "100%",
                paddingRight: "55px",
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(!showNewPassword)
              }
              disabled={!emailVerified}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: emailVerified ? "pointer" : "default",
                fontSize: "12px",
                color: "#666",
              }}
            >
              {showNewPassword ? "숨기기" : "보기"}
            </button>
          </div>
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="field">
          <label>새 비밀번호 확인</label>

          <div
            style={{
              position: "relative",
            }}
          >
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder={
                emailVerified
                  ? "새 비밀번호를 다시 입력해주세요."
                  : "이메일 인증 후 입력할 수 있습니다."
              }
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!emailVerified}
              required
              style={{
                width: "100%",
                paddingRight: "55px",
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={!emailVerified}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: emailVerified ? "pointer" : "default",
                fontSize: "12px",
                color: "#666",
              }}
            >
              {showConfirmPassword ? "숨기기" : "보기"}
            </button>
          </div>
        </div>

        {/* 비밀번호 불일치 */}
        {emailVerified &&
          confirmPassword.length > 0 &&
          newPassword !== confirmPassword && (
            <div
              className="form-err"
              style={{
                marginBottom: "12px",
              }}
            >
              비밀번호가 일치하지 않습니다.
            </div>
          )}

        {/* 에러 */}
        {error && (
          <div
            className="form-err"
            style={{
              marginBottom: "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* 성공 메시지 */}
        {message && (
          <div
            style={{
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        {/* 비밀번호 변경 버튼 */}
        <button
          className="primary"
          type="submit"
          disabled={!canChangePassword || loading}
          style={{
            width: "100%",
          }}
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>

      <div className="swap">
        <Link to="/login">로그인으로 돌아가기</Link>
      </div>
    </AuthLayout>
  );
}