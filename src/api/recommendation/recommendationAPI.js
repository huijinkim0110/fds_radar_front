import axios from "axios";

const BASE_URL = 'http://localhost:9090';

export async function getUnifiedRecommendations(dto) {
    const response = await axios.post(`${BASE_URL}/recommendations/unified`, dto);
    return response.data;
}

// 추천 이력 목록 조회(마이페이지 - 이전 추천 리스트)
export async function getRecommendationHistory(userId) {
    const response = await axios.get(`${BASE_URL}/recommendations/history`, { params: { userId } });
    return response.data;
}

// 특정 추천 이력에 속한 상품 목록 조회
export async function getRecommendationHistoryItems(recommendationResultId) {
    const response = await axios.get(`${BASE_URL}/recommendations/history/${recommendationResultId}/items`);
    return response.data;
}