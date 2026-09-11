import { useToast } from "../../context/ToastContext";

export default function Toast() {
    const { message, onClick, type } = useToast();

    if (!message) return null;

    const errorStyle = type === "error"
        ? { background: "var(--red)", color: "#fff", border: "none" }
        : undefined;

    return (
        <div 
            className="toast" 
            onClick={onClick || undefined} 
            style={{ ...(onClick ? { cursor: "pointer" } : undefined), ...errorStyle }}
        >
            {message}
        </div>
    );
}