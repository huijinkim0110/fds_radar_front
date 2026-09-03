// 챗봇 트리 메뉴 구조 정의
// implemented: true면 실제 기능 처리, false면 안내문구만 표시
export const CHAT_MENU_TREE = {
    '상품': {
        '상품 조회': {
            '예금': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'DEPOSIT' }, requiresAuth: false },
            '적금': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'SAVINGS' }, requiresAuth: false },
            '펀드': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'FUND' }, requiresAuth: false },
            '채권': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'BOND' }, requiresAuth: false },
            '저축성보험': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'INSURANCE' }, requiresAuth: false },
            '기타': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'OTHER_PRODUCT' }, requiresAuth: false },
        },
        '상품 비교': { implemented: true, action: 'PRODUCT_COMPARE', requiresAuth: true },
        '추천받기': { implemented: true, action: 'RECOMMENDATION', requiresAuth: true },
    },
    '내 정보': {
        '재무목표': { implemented: true, action: 'GOAL', requiresAuth: true },
        '투자성향 진단': { implemented: true, action: 'DIAGNOSIS', requiresAuth: false },
        '진단 결과': { implemented: true, action: 'DIAGNOSIS_RESULT', requiresAuth: true },
        '내 회원정보': { implemented: true, requiresAuth: true },
    },
    '내 거래': {
        '계좌 조회/관리': {
            '내 계좌 보기': { implemented: true, action: 'ACCOUNT_LIST', requiresAuth: true },
            '새 계좌 개설하기': { implemented: true, action: 'ACCOUNT_NEW', requiresAuth: true },
        },
        '카드 조회/관리': { 
            '내 카드 보기': { implemented: true, action: 'CARD_LIST', requiresAuth: true },
            '새 카드 발급하기': {implemented: true, action: 'CARD_NEW', requiresAuth: true },
         },
        '이체': { implemented: false, requiresAuth: true },
    },
    '사기·보안': {
        '이상거래 신고': { 
            '새로 신고하기': { implemented: true, action: 'FRAUD_REPORT_NEW', requiresAuth: true },
            '신고 내역 보기': { implemented: true, action: 'FRAUD_REPORT_HISTORY', requiresAuth: true },
         },
        '계좌·카드 잠금 요청': { 
            '잠금 신청하기': { implemented: true, action: 'LOCK_REQUEST_NEW', requiresAuth: true },
            '요청 내역 보기': { implemented: true, action: 'LOCK_REQUEST_HISTORY', requiresAuth: true },
         },
    },
    '고객센터': { 
        '1:1 상담문의': { implemented: true, action: 'CUSTOMER_SERVICE', requiresAuth: false },
        '고객센터 페이지 보기': { implemented: true, action: 'CUSTOMER_CENTER_PAGE', requiresAuth: false },
     },
};

export const NOT_IMPLEMENTED_MESSAGE = '아직 준비 중인 기능이에요.';
export const REQUIRES_AUTH_MESSAGE = '로그인이 필요한 기능이에요.';