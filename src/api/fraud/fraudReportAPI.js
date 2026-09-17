import { apiFetch } from '../apiClient';

export const getAllFraudReports = () => apiFetch('/api/fraud-reports/admin');

export const updateFraudReportStatus = (reportId, status) =>
    apiFetch(`/api/fraud-reports/${reportId}/status?status=${status}`, { method: 'PATCH' });