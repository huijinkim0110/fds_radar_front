import axios from 'axios';

const BASE_URL = 'http://localhost:9090';

// 내 잠금 요청 목록 조회(챗봇 건수 안내용)
export async function getMyLockRequests(userId) {
    const response = await axios.get(`${BASE_URL}/api/locks`, {
        params: { userId },
    });
    return response.data;
}