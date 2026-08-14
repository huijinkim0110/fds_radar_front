import axios from 'axios';

const BASE_URL = 'http://localhost:9090';

export async function addFavorite(userId, productId) {
    const response = await axios.post(`${BASE_URL}/favorite-products`, null, {
        params: { userId, productId }
    });
    return response.data;
}

export async function removeFavorite(userId, productId) {
    const response = await axios.delete(`${BASE_URL}/favorite-products`, {
        params: { userId, productId }
    });
    return response.data;
}

export async function getFavorites(userId) {
    const response = await axios.get(`${BASE_URL}/favorite-products`, {
        params: { userId }
    });
    return response.data;
}

export async function checkFavorite(userId, productId) {
    const response = await axios.get(`${BASE_URL}/favorite-products/check`, {
        params: { userId, productId }
    });
    return response.data;
}