import { useToast } from "../../context/ToastContext";

export default function Toast() {
    const { message } = useToast();

    if (!message) return null;

    return (
        <div>{message}</div>
    );
}