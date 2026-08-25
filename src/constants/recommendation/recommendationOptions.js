export const AGE_OPTIONS = ['20대', '30대', '40대', '50대', '60대', '70대', '70대 이상'];

export const GENDER_OPTIONS = ['남', '여'];

export const REGION_OPTIONS = [
    '서울', '경기도', '인천', '부산', '대구', '대전',
    '경상도', '전라도', '충청도', '기타', '미수집',
];

export const INCOME_BRACKET_OPTIONS = [
    '1000만원 미만', '3000만원 미만', '5000만원 미만', '8000만원 미만',
    '10000만원 미만', '30000만원 미만', '10000만원 이상',
];

export const OCCUPATION_GROUP_OPTIONS = [
    '관리자',
    '근로소득자/전업투자자/전문직/기타',
    '사무종사자',
    '서비스 종사자',
    '판매종사자',
    '전문가 및 관련 종사자',
    '장치·기계조작 및 조립 종사자',
    '의료/서비스업/금융업/유통업/건설',
    '제조업/정보통신/운송업/부동산업/농수산광업',
    '무직/자영업/공무원/군인/교육',
    '학생/종교/주부',
    '비경제활동인구',
    '미답변',
    '기타',
];

export const MARITAL_STATUS_OPTIONS = ['미혼', '기혼'];

// 담보유형 조합(보장/변액/기타)
export const CROSS_COVERAGE_OPTIONS = [
    '-', '보장only', '변액only', '기타only',
    '보장+변액', '보장+기타', '변액+기타', '보장+변액+기타',
];

export const DISEASE_HISTORY_OPTIONS = [
    { label: '없음', value: 'NONE' },
    { label: '근골격계', value: '근골격계' },
    { label: '기타', value: '기타' },
    { label: '내부장기계', value: '내부장기계' },
    { label: '산부인과계', value: '산부인과계' },
    { label: '소화기용종', value: '소화기용종' },
    { label: '심혈관계', value: '심혈관계' },
    { label: '안과계', value: '안과계' },
    { label: '호흡기계', value: '호흡기계' },
    { label: '관절계', value: 'JOINT' },
    { label: '뇌질환계', value: 'BRAIN' },
    { label: '신경정신계', value: 'MENTAL' },
    { label: '척추계', value: 'SPINE' },
    { label: '치아계', value: 'DENTAL' },
];

export const DISEASE_HISTORY_VALUE_MAP = {
    NONE: '없음',
    근골격계: '근골격계',
    기타: '기타',
    내부장기계: '내부장기계',
    산부인과계: '산부인과계',
    소화기용종: '소화기용종',
    심혈관계: '심혈관계',
    안과계: '안과계',
    호흡기계: '호흡기계',
    JOINT: '관절계+근골격계+척추계',
    BRAIN: '근골격계+뇌질환계',
    MENTAL: '근골격계+신경정신계+척추계+호흡기계',
    SPINE: '근골격계+척추계',
    DENTAL: '근골격계+뇌질환계+척추계+치아계',
};