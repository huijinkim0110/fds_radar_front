function generateUUID() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `guest-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export function getGuestId() {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
        guestId = generateUUID();
        localStorage.setItem("guestId", guestId);
    }
    return guestId;
}