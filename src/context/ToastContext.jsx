import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);
const DISPLAY_DURATION_MS = 2000;

export function ToastProvider({ children }) {
    const [message, setMessage] = useState(null);
    const [onClick, setOnClick] = useState(null);
    const [type, setType] = useState("default");

    const showToast = useCallback((text, clickHandler, toastType = "default", durationMs=duratinMs = DISPLAY_DURATION_MS) => {
        setMessage(text);
        setOnClick(() => clickHandler || null);
        setType(toastType);
        setTimeout(() => setMessage(null), durationMs);
    }, []);

    return (
        <ToastContext.Provider value={{ message, onClick, type, showToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast는 ToastProvider 내부에서만 사용할 수 있습니다.');
    return ctx;
}