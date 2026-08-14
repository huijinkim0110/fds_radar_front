import axios from "axios";

const BASE_URL = 'http://localhost:9090';

export async function subscribe(dto) {
    const response = await axios.post(`${BASE_URL}/simulated-subscriptions`, dto);
    return response.data;
}

export async function cancelSubscription(simulatedSubscriptionId) {
    const response = await axios.patch(`${BASE_URL}/simulated-subscriptions/${simulatedSubscriptionId}/cancel`);
    return response.data;
}

export async function getPortfolio(userId) {
    const response = await axios.get(`${BASE_URL}/simulated-subscriptions`, {
        params: { userId }
    });
    return response.data;
}