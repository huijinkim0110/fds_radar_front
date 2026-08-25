import axios from "axios";

const BASE_URL = 'http://localhost:9090';

export async function getGoals(userId, includeCancelled = false) {
    const response = await axios.get(`${BASE_URL}/financial-goals`, {
        params: { userId, includeCancelled },
    });
    return response.data;
}

export async function createGoal(dto) {
    const response = await axios.post(`${BASE_URL}/financial-goals`, dto);
    return response.data;
}

export async function updateCurrentAmount(goalId, amount) {
    const response = await axios.patch(`${BASE_URL}/financial-goals/${goalId}/current-amount`, null, {
        params: { amount },
    });
    return response.data;
}

export async function cancelGoal(goalId) {
    await axios.patch(`${BASE_URL}/financial-goals/${goalId}/cancel`);
}