import { apiFetch } from '../apiClient';

export const addFavorite = (productId) =>
    apiFetch(`/favorite-products?productId=${productId}`, { method: 'POST' });

export const removeFavorite = (productId) =>
    apiFetch(`/favorite-products?productId=${productId}`, { method: 'DELETE' });

export const getFavorites = () => apiFetch('/favorite-products');

export const checkFavorite = (productId) =>
    apiFetch(`/favorite-products/check?productId=${productId}`);