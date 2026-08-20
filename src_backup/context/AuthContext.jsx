import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { name, role }

  useEffect(() => {
    // 토큰이 있으면 로그인 유저 정보를 불러옴
    if (localStorage.getItem("accessToken")) {
      api.getMe().then(setUser).catch(() => setUser(null));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);