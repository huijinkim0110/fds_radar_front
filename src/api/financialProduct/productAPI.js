import axios from 'axios';

const BASE_URL = 'http://localhost:9090';

export async function getProducts(params = {}) {
    const response = await axios.get(`${BASE_URL}/products`, {
        params: {
            productTypes: params.productTypes?.length ? params.productTypes.join(',') : undefined,
            riskLevels: params.riskLevels?.length ? params.riskLevels.join(',') : undefined,
            sortType: params.sortType || undefined,
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