// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // 처음 마운트될 때 localStorage 확인
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      setIsDark(true);
    } else {
      document.body.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // 다크모드 토글 함수
  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const nextDark = !prev;
      if (nextDark) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return nextDark;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);