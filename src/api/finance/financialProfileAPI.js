import axios from "axios";

const BASE_URL = "http://localhost:9090/api/financial-profiles";

export async function getFinancialProfile(userId) {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    return response.data;
}

export async function hasFinancialProfile(userId) {
    const response = await axios.get(`${BASE_URL}/exists`, {
        params: { userId },
    });

    return response.data;
}

export async function upsertFinancialProfile(dto) {
    const response = await axios.post(BASE_URL, dto);
    return response.data;
}