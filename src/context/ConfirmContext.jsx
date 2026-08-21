import { createContext, useCallback, useContext, useRef, useState } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [message, setMessage] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((text) => {
        setMessage(text);
        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    function handleConfirm() {
        resolveRef.current?.(true);
        setMessage(null);
    }

    function handleCancel() {
        resolveRef.current?.(false);
        setMessage(null);
    }

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {message && (
                <div>
                    <div>
                        <p>{message}</p>
                        <button type="button" onClick={handleConfirm}>확인</button>
                        <button type="button" onClick={handleCancel}>취소</button>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm은 ConfirmProvider 내부에서만 사용할 수 있습니다.');
    return ctx.confirm;
}