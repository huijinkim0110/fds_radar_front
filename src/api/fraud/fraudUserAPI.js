import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 유저 본인의 이상거래 목록 조회
// TODO(로그인 기능 붙으면 수정): 지금은 userId를 직접 넘겨받아서 쿼리 파라미터로 전달
export async function getMyFraudCases(userId) {
    const response = await axios.get(`${BASE_URL}/api/fraud-cases`, {
        params: { userId },
    });
    return response.data;
}

// 6차: 사용자가 본인거래 여부(MINE/NOT_MINE)를 직접 응답
export async function confirmFraudCase(fraudCaseId, confirmation) {
    const response = await axios.patch(
        `${BASE_URL}/api/fraud-cases/${fraudCaseId}/confirmation`,
        { confirmation }
    );
    return response.data;
}