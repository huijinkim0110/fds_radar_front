import { createContext, useCallback, useContext, useRef, useState } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [message, setMessage] = useState(null);
    const [labels, setLabels] = useState({ confirm: "확인", cancel: "취소" });
    const resolveRef = useRef(null);

    const confirm = useCallback((text, options = {}) => {
        setMessage(text);
        setLabels({ confirm: options.confirmLabel ?? "확인", cancel: options.cancelLabel ?? "취소" });
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

    const overlayStyle = {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    };

    const boxStyle = {
        position: "relative",
        background: "var(--panel, #fff)",
        borderRadius: 12,
        padding: "28px",
        maxWidth: 360,
        width: "90%",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        textAlign: "center",
    };

    const closeBtnStyle = {
        position: "absolute",
        top: 12,
        right: 12,
        border: "none",
        background: "transparent",
        fontSize: 18,
        lineHeight: 1,
        cursor: "pointer",
        color: "var(--muted, #888)",
    };

    const messageStyle = {
        margin: "0 0 22px",
        fontSize: 15,
        lineHeight: 1.5,
        color: "var(--ink, #111)",
    };

    const buttonRowStyle = {
        display: "flex",
        gap: 10,
        justifyContent: "center",
    };

    const cancelBtnStyle = {
        padding: "9px 16px",
        borderRadius: 8,
        border: "1px solid var(--line, #ddd)",
        background: "transparent",
        cursor: "pointer",
    };

    const confirmBtnStyle = {
        padding: "9px 16px",
        borderRadius: 8,
        border: "none",
        background: "var(--blue, #3b82f6)",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {message && (
                <div style={overlayStyle}>
                    <div style={boxStyle}>
                        <button type="button" onClick={handleCancel} aria-label="닫기" style={closeBtnStyle}>
                            ✕
                        </button>

                        <p style={messageStyle}>{message}</p>

                        <div style={buttonRowStyle}>
                            {labels.cancel && (
                                <button type="button" onClick={handleCancel} style={cancelBtnStyle}>
                                    {labels.cancel}
                                </button>
                            )}
                            <button type="button" onClick={handleConfirm} style={confirmBtnStyle}>
                                {labels.confirm}
                            </button>
                        </div>
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