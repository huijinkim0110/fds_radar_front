import axios from "axios";

const BASE_URL = 'http://localhost:9090';

export async function getFinancialProfile(userId) {
    const response = await axios.get(`${BASE_URL}/financial-profiles`, {
        params: { userId }, 
    });
    return response.data;
}

export async function hasFinancialProfile(userId) {
    const response = await axios.get(`${BASE_URL}/financial-profiles/exists`, {
        params: { userId },
    });
    return response.data;
}

export async function upsertFinancialProfile(dto) {
    const response = await axios.post(`${BASE_URL}/financial-profiles`, dto);
    return response.data;
}