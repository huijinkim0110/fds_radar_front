import { apiFetch } from '../apiClient';

// 관리자 마이페이지 대시보드 조회(사건 현황 + 상담 현황 통합)
export async function getAdminDashboard() {
    return apiFetch('/api/admin/dashboard/mypage');
}