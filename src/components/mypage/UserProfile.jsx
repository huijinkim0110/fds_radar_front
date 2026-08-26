import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      birthDate: user?.birthDate || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      birthDate: user?.birthDate || "",
    });

    setIsEditing(false);
  };

  const handleSave = () => {
    // TODO 회원정보 수정 API 연결
    console.log("회원정보 수정:", form);
    setIsEditing(false);
  };

  return (
    <>
      <TopBar
        title="회원정보"
        crumb="홈 / 내 정보 / 회원정보"
        search={false}
      />

      <Panel
        title="내 프로필"
        sub="회원가입 시 등록한 기본 정보를 확인하고 관리할 수 있습니다."
        right={
          !isEditing && (
            <button
              className="minibtn"
              onClick={() => setIsEditing(true)}
            >
              정보 수정
            </button>
          )
        }
      >
        {/* 프로필 상단 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "10px 0 22px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="avatar"
            style={{
              width: "54px",
              height: "54px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            {form.name ? form.name.charAt(0) : "U"}
          </div>

          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "5px",
              }}
            >
              {form.name || "사용자"}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginBottom: "7px",
              }}
            >
              {form.email || "이메일 정보 없음"}
            </div>

            <span className="filterpill">
              {user?.role || "USER"}
            </span>
          </div>
        </div>

        {/* 기본 정보 */}
        <div style={{ marginTop: "6px" }}>
          <InfoRow
            label="이름"
            editing={isEditing}
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <InfoRow
            label="이메일"
            editing={isEditing}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <InfoRow
            label="전화번호"
            editing={isEditing}
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <InfoRow
            label="생년월일"
            editing={isEditing}
            name="birthDate"
            type="date"
            value={form.birthDate}
            onChange={handleChange}
          />
        </div>

        {/* 수정 버튼 */}
        {isEditing && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            <button
              className="minibtn"
              onClick={handleCancel}
            >
              취소
            </button>

            <button
              className="minibtn"
              style={{
                background: "var(--blue)",
                borderColor: "var(--blue)",
                color: "#fff",
              }}
              onClick={handleSave}
            >
              저장
            </button>
          </div>
        )}
      </Panel>
    </>
  );
}

function InfoRow({
  label,
  editing,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        alignItems: "center",
        minHeight: "62px",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "var(--muted)",
          fontWeight: "600",
        }}
      >
        {label}
      </div>

      {editing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "var(--panel2)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
            padding: "10px 12px",
            color: "var(--ink)",
            fontSize: "13px",
            outline: "none",
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--ink)",
          }}
        >
          {value || "-"}
        </div>
      )}
    </div>
  );
}