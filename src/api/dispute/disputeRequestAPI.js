import { apiFetch } from '../apiClient';

export const getAllDisputeRequests = () => apiFetch('/api/dispute-requests/admin');

export const approveDisputeRequest = (disputeRequestId) =>
    apiFetch(`/api/dispute-requests/${disputeRequestId}/approve`, { method: 'PUT' });

export const rejectDisputeRequest = (disputeRequestId, adminResponse) =>
    apiFetch(`/api/dispute-requests/${disputeRequestId}/reject?adminResponse=${encodeURIComponent(adminResponse)}`, { method: 'PUT' });