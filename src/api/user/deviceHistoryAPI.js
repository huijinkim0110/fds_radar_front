import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 등록된 로그인 기기 조회
export async function getUserDevices(userId) {
  const response = await axios.get(
    `${BASE_URL}/api/users/${userId}/devices`
  );

  return response.data;
}

// 로그인 기기 등록
export async function registerUserDevice(userId, deviceData) {
  const response = await axios.post(
    `${BASE_URL}/api/users/${userId}/devices`,
    deviceData
  );

  return response.data;
}

// 로그인 이력 조회
export async function getLoginHistories(userId) {
  const response = await axios.get(
    `${BASE_URL}/api/users/${userId}/login-histories`
  );

  return response.data;
}

// 로그인 이력 저장
export async function recordLoginHistory(userId, historyData) {
  const response = await axios.post(
    `${BASE_URL}/api/users/${userId}/login-histories`,
    historyData
  );

  return response.data;
}