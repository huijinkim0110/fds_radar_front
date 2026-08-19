// 챗봇 트리 메뉴 구조 정의
// implemented: true면 실제 기능 처리, false면 안내문구만 표시
export const CHAT_MENU_TREE = {
    '상품': {
        '상품 조회': {
            '예금': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'DEPOSIT' } },
            '적금': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'SAVINGS' } },
            '펀드': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'FUND' } },
            '채권': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'BOND' } },
            '저축성보험': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'INSURANCE' } },
            '기타': { implemented: true, action: 'PRODUCT_INQUIRY', payload: { productType: 'OTHER_PRODUCT' } },
        },
        '상품 비교': { implemented: true, action: 'PRODUCT_COMPARE' },
        '추천받기': { implemented: true, action: 'RECOMMENDATION' },
    },
    '내 정보': {
        '투자성향 진단': { implemented: true, action: 'DIAGNOSIS' },
        '진단 결과': { implemented: true, action: 'DIAGNOSIS_RESULT' },
        '재무목표': { implemented: true, action: 'GOAL' },
        '내 회원정보': { implemented: false },
    },
    '내 거래': {
        '계좌 조회/관리': { implemented: false },
        '카드 조회/관리': { implemented: false },
        '이체': { implemented: false },
    },
    '사기·보안': {
        '이상거래 신고': { implemented: false },
        '계좌·카드 잠금 요청': { implemented: false },
    },
    '고객센터': {
        implemented: false,
    },
};

export const NOT_IMPLEMENTED_MESSAGE = '아직 준비 중인 기능이에요.';