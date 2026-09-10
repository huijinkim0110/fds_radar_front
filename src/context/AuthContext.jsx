import { createContext, useContext, useState } from "react";
import { api } from "../api/client.js";

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
    setUser(userInfo);

    try {
      let deviceIdentifier = localStorage.getItem("deviceIdentifier");

      if (!deviceIdentifier) {
        deviceIdentifier = crypto.randomUUID();
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
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);