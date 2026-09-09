import axios from "axios";

const BASE_URL = "http://localhost:9090/api/fraud-reports";

// [D파트 추가] 관리자 - 신고 전체 조회
export function getAllFraudReports() {
  return axios.get(`${BASE_URL}/admin`).then((res) => res.data);
}

// [D파트 추가] 관리자 - 신고 상태 변경
export function updateFraudReportStatus(reportId, status) {
  return axios
    .patch(`${BASE_URL}/${reportId}/status`, { status })
    .then((res) => res.data);
}