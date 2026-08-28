import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 등록된 로그인 기기 조회
export async function getUserDevices(userId) {
    const response = await axios.get(
        `${BASE_URL}/api/users/${userId}/devices`
    );

    return response.data;
}

// 로그인 이력 조회
export async function getLoginHistorues(userId) {
    const response = await axios.get(
        `${BASE_URL}/api/users/${userId}/login-histories`
    );

    return response.data;
}