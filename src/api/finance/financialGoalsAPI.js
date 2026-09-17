import { apiFetch } from '../apiClient';

export const getGoals = (includeCancelled = false) =>
  apiFetch(`/financial-goals?includeCancelled=${includeCancelled}`);

export const createGoal = (dto) =>
  apiFetch('/financial-goals', { method: 'POST', body: JSON.stringify(dto) });

export const updateCurrentAmount = (goalId, amount) =>
  apiFetch(`/financial-goals/${goalId}/current-amount?amount=${amount}`, { method: 'PATCH' });

export const cancelGoal = (goalId) =>
  apiFetch(`/financial-goals/${goalId}/cancel`, { method: 'PATCH' });