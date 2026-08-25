import axios from "axios";

const BASE_URL = 'http://localhost:9090';

export async function getUnifiedRecommendations(dto) {
    const response = await axios.post(`${BASE_URL}/recommendations/unified`, dto);
    return response.data;
}