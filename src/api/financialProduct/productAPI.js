import axios from 'axios';

const BASE_URL = 'http://localhost:9090';

export async function getProducts(params = {}) {
    const response = await axios.get(`${BASE_URL}/products`, {
        params: {
            productType: params.productType || undefined,
            riskLevel: params.riskLevel || undefined,
            page: params.page ?? 0,
            size: params.size ?? 12,
        },
    });
    return response.data;
}

export async function getProductDetail(productId) {
    const response = await axios.get(`${BASE_URL}/products/${productId}`);
    return response.data;
}