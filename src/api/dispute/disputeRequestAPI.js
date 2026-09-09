import axios from "axios";

const BASE_URL = "http://localhost:9090/api/dispute-requests";

// [D파트 추가] 관리자 - 이의제기 전체 조회
export function getAllDisputeRequests() {
  return axios.get(`${BASE_URL}/admin`).then((res) => res.data);
}

// [D파트 추가] 관리자 - 이의제기 승인
export function approveDisputeRequest(disputeRequestId) {
  return axios.put(`${BASE_URL}/${disputeRequestId}/approve`).then((res) => res.data);
}

// [D파트 추가] 관리자 - 이의제기 반려
export function rejectDisputeRequest(disputeRequestId, adminResponse) {
  return axios
    .put(`${BASE_URL}/${disputeRequestId}/reject`, null, { params: { adminResponse } })
    .then((res) => res.data);
}