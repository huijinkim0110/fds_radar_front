import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 관리자 마이페이지 대시보드 조회(사건 현황 + 상담 현황 통합)
// TODO(로그인 기능 붙으면 수정): 지금은 adminId를 직접 넘겨받아서 쿼리 파라미터로 전달
export async function getAdminDashboard(adminId) {
    const response = await axios.get(`${BASE_URL}/api/admin/dashboard/mypage`, {
        params: { adminId },
    });
    return response.data;
}