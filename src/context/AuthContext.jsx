import { createContext, useContext, useState } from "react";
import { useEffect, useRef } from "react";
import { api } from "../api/client.js";
import { refreshAccessToken } from "../api/apiClient.js";
import { useConfirm } from "./ConfirmContext.jsx";

import {
  registerUserDevice,
  recordLoginHistory,
} from "../api/user/deviceHistoryAPI.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const confirm = useConfirm();
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) scheduleAutoLogout(token);
  }, []);

  function scheduleAutoLogout(accessToken) {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const delay = payload.exp * 1000 - Date.now();

      const handleExpire = async () => {
        const extend = await confirm(
          "세션이 만료되었습니다.",
          { confirmLabel: "연장하기", cancelLabel: "" }
        );

        if (!extend) {
          logout();
          window.location.href = "/";
          return;
        }

        try {
          const newAccessToken = await refreshAccessToken();
          scheduleAutoLogout(newAccessToken);
        } catch {
          logout();
          window.location.href = "/login";
        }
      };

      if (delay <= 0) {
        handleExpire();
        return;
      }

      logoutTimerRef.current = setTimeout(handleExpire, delay);
    } catch {
      // 토큰 파싱 실패 시 무시
    }
  }

  async function login(credentials) {
    const data = await api.login(credentials);

    const userInfo = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate
        ? String(data.birthDate).slice(0, 10)
        : "",
      role: data.role,
      userId: data.userId,
    };

    localStorage.setItem("user", JSON.stringify(userInfo));
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(userInfo);
    scheduleAutoLogout(data.accessToken);

    try {
      let deviceIdentifier = localStorage.getItem("deviceIdentifier");

      // crypto.randomUUID()를 사용할 수 없는 환경(AWS HTTP 등)에서도
      // 기기 식별자를 생성할 수 있도록 fallback 처리
      if (!deviceIdentifier) {
        deviceIdentifier =
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `device-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 10)}`;

        localStorage.setItem(
          "deviceIdentifier",
          deviceIdentifier
        );
      }

      const platform =
        navigator.userAgentData?.platform ||
        navigator.platform ||
        "Unknown Device";

      const deviceName = `${platform} 브라우저`;

      const device = await registerUserDevice(
        data.userId,
        {
          deviceId: deviceIdentifier,
          deviceName: deviceName,
        }
      );

      await recordLoginHistory(
        data.userId,
        {
          deviceId: device.deviceId,
          loginResult: "SUCCESS",
          failureReason: null,
        }
      );

      console.log("로그인 기기 및 이력 저장 완료");
    } catch (error) {
      console.error(
        "로그인 기기/이력 저장 실패:",
        error
      );
    }

    return data;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);