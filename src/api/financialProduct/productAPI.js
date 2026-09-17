import { apiFetch } from '../apiClient';

export async function getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.productTypes?.length) query.set('productTypes', params.productTypes.join(','));
    if (params.riskLevels?.length) query.set('riskLevels', params.riskLevels.join(','));
    if (params.sortType) query.set('sortType', params.sortType);
    query.set('page', params.page ?? 0);
    query.set('size', params.size ?? 12);
    return apiFetch(`/products?${query.toString()}`);
}

export async function getProductDetail(productId) {
    return apiFetch(`/products/${productId}`);
}