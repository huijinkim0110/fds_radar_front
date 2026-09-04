
import axios from "axios";
 
const BASE_URL = "http://localhost:9090";
 
// 내 거래내역 조회
// TODO(로그인 기능 붙으면 수정): 지금은 userId를 직접 넘겨받아서 쿼리 파라미터로 전달
// size를 크게 잡아서 한 번에 다 받아오고, 페이징은 프론트(Transactions.jsx)에서 클라이언트 사이드로 처리
export async function getMyTransactions(userId) {
    const response = await axios.get(`${BASE_URL}/api/transactions`, {
        params: { userId, page: 0, size: 1000 },
    });
    return response.data; // Page<TransactionResponse> — .content가 실제 배열
}
 
