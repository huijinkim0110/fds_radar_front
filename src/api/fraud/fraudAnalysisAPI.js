import axios from "axios";

const BASE_URL = "http://localhost:9090";

// 오탐 목록 조회
export async function getFalsePositives() {
    const response = await axios.get(`${BASE_URL}/api/admin/fraud-analysis/false-positives`);
    return response.data;
}

// 미탐 목록 조회
export async function getFalseNegatives() {
    const response = await axios.get(`${BASE_URL}/api/admin/fraud-analysis/false-negatives`);
    return response.data;
}