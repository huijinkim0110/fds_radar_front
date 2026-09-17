import { apiFetch } from "../apiClient";

// 등록된 로그인 기기 조회
export async function getUserDevices(userId) {
  return apiFetch(`/api/users/${userId}/devices`);
}

// 로그인 기기 등록
export async function registerUserDevice(userId, deviceData) {
  return apiFetch(`/api/users/${userId}/devices`, {
    method: 'POST',
    body: JSON.stringify(deviceData),
  });
}

// 로그인 이력 조회
export async function getLoginHistories(userId) {
  return apiFetch(`/api/users/${userId}/login-histories`);
}

// 로그인 이력 저장
export async function recordLoginHistory(userId, historyData) {
  return apiFetch(`/api/users/${userId}/login-histories`, {
    method: 'POST',
    body: JSON.stringify(historyData),
  });
}