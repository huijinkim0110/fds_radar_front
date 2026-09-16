const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

// 내 카드 목록
export const getMyCards = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/cards?userId=${userId}`, { method: "GET" });
  if (!response.ok) throw new Error("카드 목록 조회에 실패했습니다.");
  return response.json();
};

// 카드 상세 (나중에 쓸 수도)
export const getCard = async (userId, cardId) => {
  const response = await fetch(`${BASE_URL}/api/cards/${cardId}?userId=${userId}`, { method: "GET" });
  if (!response.ok) throw new Error("카드 상세 조회에 실패했습니다.");
  return response.json();
};