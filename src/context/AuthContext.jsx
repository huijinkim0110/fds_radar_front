import { createContext, useContext, useState } from "react";
import { api } from "../api/client.js";

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