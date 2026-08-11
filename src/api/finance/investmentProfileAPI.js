import axios from 'axios';

const BASE_URL = "http://localhost:9090";

export async function submitDiagnosis(diagnosisData) {
    const response = await axios.post(`${BASE_URL}/investment-profiles`, diagnosisData);
    return response.data;
}

export async function getRecentProfiles(userId, limit = 3) {
    const response = await axios.get(`${BASE_URL}/investment-profiles`, {
        params: { userId, limit },
    });
    return response.data;
}

export async function getLatestProfile(userId) {
    const response = await axios.get(`${BASE_URL}/investment-profiles/latest`, {
        params: {userId},
    });
    return response.data;
}

export async function hasDiagnosisHistory(userId) {
    const response = await axios.get(`${BASE_URL}/investment-profiles/exists`, {
        params: {userId},
    });
    return response.data;
}