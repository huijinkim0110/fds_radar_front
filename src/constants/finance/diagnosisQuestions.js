export const DIAGNOSIS_QUESTIONS = [
    {
        id: 'ageScore',
        question: '연령대가 어떻게 되세요?',
        options: [
            { label: '20대 이하', value: 3 },
            { label: '30~40대', value: 2 },
            { label: '50대', value: 1 },
            { label: '60대 이상', value: 0 },
        ],
    },
    {
        id: 'investmentExperienceScore',
        question: '투자 경험이 어느 정도인가요?',
        options: [
            { label: '없음', value: 0 },
            { label: '예적금 위주', value: 1 },
            { label: '펀드·채권 경험', value: 2 },
            { label: '주식·파생상품 경험', value: 3 },
        ],
    },
    {
        id: 'knowledgeLevelScore',
        question: '금융상품에 대한 지식수준은?',
        options: [
            { label: '매우 낮음', value: 0 },
            { label: '낮음', value: 1 },
            { label: '보통', value: 2 },
            { label: '높음', value: 3},
        ],
    },
    {
        id: 'preferredPeriodScore',
        question: '투자 가능 기간은?',
        options: [
            { label: '1년 미만', value: 0 },
            { label: '1~3년', value: 1 },
            { label: '3년 이상', value: 2},
        ],
    },
    {
        id: 'assetRatioScore',
        question: '자산 대비 투자 가능 금액 비중은?',
        options: [
            { label: '낮음', value: 0 },
            { label: '보통', value: 1 },
            { label: '높음', value: 2 },
        ],
    },
    {
        id: 'lossToleranceScore',
        question: '원금 손실이 발생하면 감내할 수 있는 수준은?',
        options: [
            { label: '전혀 안됨', value: 0 },
            { label: '소폭', value: 1 },
            { label: '어느 정도', value: 2 },
            { label: '높은 손실도 가능', value: 3 },
        ],
    },
];

export const PRINCIPAL_PROTECTION_QUESTION = {
    question: '원금 보장이 꼭 필요하다고 생각하나요?',
    options: [
        { label: '그렇다', value: true },
        { label: '아니다', value: false },
    ],
};