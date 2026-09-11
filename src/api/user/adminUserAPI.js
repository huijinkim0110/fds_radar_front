import axios from "axios";

const BASE_URL = "http://localhost:9090";

// [D파트 담당자 추가] 관리자 - 전체 회원 목록 조회
export async function getAllUsers() {
  const response = await axios.get(
    `${BASE_URL}/api/admin/users`
  );

  return response.data;
}

// [D파트 담당자 추가] 관리자 - 회원 상태 변경 (정지/해제)
export async function updateUserStatus(userId, status) {
  const response = await axios.patch(
    `${BASE_URL}/api/admin/users/${userId}/status`,
    { status }
  );

  return response.data;
}