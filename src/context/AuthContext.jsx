import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { name, role }
  const [ready, setReady] = useState(false); // getMe 완료 여부

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      api.getMe().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  // 로그인: 토큰 받고 → 유저 정보 세팅
  async function login(credentials) {
    await api.login(credentials);
    const me = await api.getMe();
    setUser(me);
    return me; // role 보고 페이지에서 라우팅
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
