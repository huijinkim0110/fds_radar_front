// 로그인 기기/이력 페이지
import TopBar from "../TopBar.jsx";
import Panel from "../Panel.jsx";
import { useAuth } from "../../context/AuthContext";

export default function LoginDeviceHistory() {
    const { user } = useAuth();
    console.log("현재 로그인 사용자:", user);
    
    return (
    <>
      <TopBar
        title="로그인 기기 이력"
        crumb="홈 / 내 정보 / 로그인 기기 이력"
        search={false}
      />

      <Panel
        title="등록 기기"
        sub="내 계정에 등록된 기기를 확인할 수 있습니다."
      >
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "13px",
          }}
        >
          등록된 기기가 없습니다.
        </div>
      </Panel>

      <Panel
        title="로그인 이력"
        sub="최근 로그인 기록을 확인할 수 있습니다."
        style={{ marginTop: "16px" }}
      >
        <div
          style={{
            padding: "28px 0",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "13px",
          }}
        >
          로그인 기록이 없습니다.
        </div>
      </Panel>
    </>
  );
}