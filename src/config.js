// API 기본 URL 설정
const API_BASE_URL = "http://localhost:9090";

// Project API ENDPOINT
export const ENDPOINT = {
   ACCOUNT : {
    LOGIN: `${API_BASE_URL}/login`,
    LOGOUT: `${API_BASE_URL}/logout`,
    ME: `${API_BASE_URL}/account/me`,
   }
}

// axios 기본 설정
// HTTP 통신에 필요한 추가 설정을 적용하는 변수
export const axiosConfig = {
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true, // 쿠키/인증 정보를 포함한 요청 허용
};

// 다른 파일에서 import를 하기 위한 default 설정
export default {
    API_BASE_URL,
    ENDPOINT,
    axiosConfig
}