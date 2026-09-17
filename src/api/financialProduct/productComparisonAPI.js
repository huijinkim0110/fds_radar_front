import { apiFetch } from '../apiClient';

export const createComparison = (comparisonName) =>
    apiFetch(`/product-comparisons?comparisonName=${encodeURIComponent(comparisonName)}`, { method: 'POST' });

export const addItem = (comparisonId, productId) =>
    apiFetch(`/product-comparisons/${comparisonId}/items?productId=${productId}`, { method: 'POST' });

export const removeItem = (comparisonId, comparisonItemId) =>
    apiFetch(`/product-comparisons/${comparisonId}/items/${comparisonItemId}`, { method: 'DELETE' });

export const getComparisonDetail = (comparisonId) =>
    apiFetch(`/product-comparisons/${comparisonId}`);

export const getUserComparisons = () => apiFetch('/product-comparisons');

export const renameComparison = (comparisonId, comparisonName) =>
    apiFetch(`/product-comparisons/${comparisonId}?comparisonName=${encodeURIComponent(comparisonName)}`, { method: 'PATCH' });