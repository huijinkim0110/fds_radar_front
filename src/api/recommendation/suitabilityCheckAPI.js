import axios from 'axios';

const BASE_URL = 'http://localhost:9090';

export async function checkSuitability(userId, productId) {
    const response = await axios.post(`${BASE_URL}/suitability-checks`, {
        userId,
        productId
    });
    return response.data;
}