import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);
const DISPLAY_DURATION_MS = 2000;

export function ToastProvider({ children }) {
    const [message, setMessage] = useState(null);

    const showToast = useCallback((text) => {
        setMessage(text);
        setTimeout(() => setMessage(null), DISPLAY_DURATION_MS);
    }, []);

    return (
        <ToastContext.Provider value={{ message, showToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast는 ToastProvider 내부에서만 사용할 수 있습니다.');
    return ctx;
}