import axios from "axios";

const BASE_URL = 'http://localhost:9090';

// 내 신고 목록 조회(챗봇 건수 안내용)
export async function getMyFraudReports(userId) {
    const response = await axios.get(`${BASE_URL}/api/fraud-reports/user/${userId}`);
    return response.data;
}