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
    
]