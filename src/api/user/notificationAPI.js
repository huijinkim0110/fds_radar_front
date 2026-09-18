import { apiFetch } from '../apiClient';

// 알림 전체 조회
export async function getNotifications(userId) {
    return apiFetch(`/api/users/${userId}/notifications`);
}

// 알림 읽음 처리
export async function readNotifications(userId, notificationId) {
    return apiFetch(`/api/users/${userId}/notifications/${notificationId}/read`, {
        method: 'PATCH',
    });
}