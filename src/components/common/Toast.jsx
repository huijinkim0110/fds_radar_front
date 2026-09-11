import { useToast } from "../../context/ToastContext";

export default function Toast() {
    const { message, onClick } = useToast();

    if (!message) return null;

    return (
        <div className="toast" onClick={onClick || undefined} style={onClick ? { cursor: "pointer" } : undefined}>
            {message}
        </div>
    );
}