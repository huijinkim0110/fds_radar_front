import { apiFetch } from '../api/apiClient';

// 계좌 개설
export const createAccount = (accountData) =>
  apiFetch('/api/accounts', { method: 'POST', body: JSON.stringify(accountData) });

// 내 계좌 목록
export const getMyAccounts = () => apiFetch('/api/accounts');

// 계좌 상세
export const getAccount = (accountId) => apiFetch(`/api/accounts/${accountId}`);

// 일일 이체한도 변경
export const updateAccountLimit = (accountId, limitData) =>
  apiFetch(`/api/accounts/${accountId}/limit`, { method: 'PATCH', body: JSON.stringify(limitData) });

// 계좌 해지
export const closeAccount = (accountId) =>
  apiFetch(`/api/accounts/${accountId}`, { method: 'DELETE' });

// 계좌 이체
export const transfer = (receiverAccountNumber, amount) =>
  apiFetch('/api/transactions/transfer', {
    method: 'POST',
    body: JSON.stringify({ receiverAccountNumber, amount }),
  });

// 내 수취인 목록
export const getMyRecipients = () => apiFetch('/api/recipients');
