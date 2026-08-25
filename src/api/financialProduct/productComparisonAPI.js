import axios from "axios";

const BASE_URL = 'http://localhost:9090';

export async function createComparison(userId, comparisonName) {
    const response = await axios.post(`${BASE_URL}/product-comparisons`, null, {
        params: { userId, comparisonName }
    });
    return response.data;
}

export async function addItem(comparisonId, productId) {
    const response = await axios.post(`${BASE_URL}/product-comparisons/${comparisonId}/items`, null, {
        params: { productId }
    });
    return response.data;
}

export async function removeItem(comparisonId, comparisonItemId) {
    await axios.delete(`${BASE_URL}/product-comparisons/${comparisonId}/items/${comparisonItemId}`);
}

export async function getComparisonDetail(comparisonId) {
    const response = await axios.get(`${BASE_URL}/product-comparisons/${comparisonId}`);
    return response.data;
}

export async function getUserComparisons(userId) {
    const response = await axios.get(`${BASE_URL}/product-comparisons`, {
        params: { userId }
    });
    return response.data;
}

export async function renameComparison(comparisonId, comparisonName) {
    const response = await axios.patch(`${BASE_URL}/product-comparisons/${comparisonId}`, null, {
        params: { comparisonName }
    });
    return response.data;
}