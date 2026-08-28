import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 알림 전체 조회
export async function getNotifications(userId) {
    const response = await axios.get(
        `${BASE_URL}/api/users/${userId}/notifications`
    );

    return response.data;
}

// 알림 읽음 처리
export async function readNotifications(userId, notificationId) {
    await axios.patch(
       `${BASE_URL}/api/users/${userId}/notifications/${notificationId}/read`
    );
}