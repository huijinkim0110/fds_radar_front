import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 회웑정보 조회
export async function getUserProfile(userId) {
    const response = await axios.get(
        `${BASE_URL}/api/users/${userId}`
    );

    return response.data;
}

// 회원정보 수정
export async function updateUserProfile(userId, userDate) {
    const response = await axios.put(
        `${BASE_URL}/api/users/${userId}`,
        userDate
    );

    return response.data;
}