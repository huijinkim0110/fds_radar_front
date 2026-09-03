import { useNavigate } from "react-router-dom";
import { getProducts } from '../../api/financialProduct/productAPI';
import { hasDiagnosisHistory } from '../../api/finance/investmentProfileAPI';
import { getGoals } from '../../api/finance/financialGoalsAPI';
import { getMyFraudReports } from "../../api/fraud/fraudReportAPI";
import { getMyLockRequests } from "../../api/dispute/lockRequestAPI";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

// 트리 메뉴에서 implemented: true인 리프 노드 클릭 시 실행할 액션들
// connectAdmin: 상담원 연결(소켓 연결 + adminMode 전환) 콜백, ChatWidget의 enterAdminMode 주입
export function useChatActions(addLocalMessage, resetMenu, connectAdmin) {
    const navigate = useNavigate();

    function runAction(node) {
        switch (node.action) {
            case 'PRODUCT_INQUIRY':
                return handleProductInquiry(node.payload?.productType);
            case 'PRODUCT_COMPARE':
                return handleProductCompare();
            case 'RECOMMENDATION':
                return handleRecommendation();
            case 'DIAGNOSIS':
                return handleDiagnosis();
            case 'DIAGNOSIS_RESULT':
                return handleDiagnosisResult();
            case 'GOAL':
                return handleGoal();
            case 'MY_PROFILE':
                return handleMyProfile();
            case 'ACCOUNT_LIST':
                return handleAccountList();
            case 'ACCOUNT_NEW':
                return handleAccountNew();
            case 'CARD_LIST':
                return handleCardList();
            case 'CARD_NEW':
                return handleCardNew();
            case 'FRAUD_REPORT_NEW':
                return handleFraudReportNew();
            case 'FRAUD_REPORT_HISTORY':
                return handleFraudReportHistory();
            case 'LOCK_REQUEST_NEW':
                return handleLockRequestNew();
            case 'LOCK_REQUEST_HISTORY':
                return handleLockRequestHistory();
            case 'CUSTOMER_SERVICE':
                return handleCustomerService();
            case 'CUSTOMER_CENTER_PAGE':
                return handleCustomerCenterPage();
            default:
                addLocalMessage('BOT', '처리할 수 없는 요청이에요.');
        }
    }

    function handleProductInquiry(productType) {
        getProducts({ productType, size: 3 })
            .then((data) => {
                const products = data.content || [];
                if (products.length === 0) {
                    addLocalMessage('BOT', '조건에 맞는 상품을 찾지 못했어요.');
                    return;
                }
                const names = products.map((p) => p.productName).join(', ');
                addLocalMessage('BOT', `이런 상품들이 있어요: ${names}`, [{ path: '/products', label: '상품 목록 보기' }]);
            })
            .catch(() => addLocalMessage('BOT', '상품 조회 중 오류가 발생했어요.'))
            .finally(resetMenu);
    }

    function handleProductCompare() {
        addLocalMessage('BOT', '상품 목록에서 비교하고 싶은 상품들을 선택해주세요.', [{ path: '/products', label: '상품 목록 보기' }]);
        resetMenu();
    }

    function handleRecommendation() {
        hasDiagnosisHistory(TEMP_USER_ID)
            .then((hasHistory) => {
                if (!hasHistory) {
                    addLocalMessage('BOT', '추천을 받으려면 먼저 투자성향 진단이 필요해요.', [{ path: '/investment-diagnosis', label: '진단하러 가기' }]);
                } else {
                    addLocalMessage('BOT', '투자성향에 맞는 상품을 추천해드릴게요.', [{ path: '/mypage/recommendations', label: '추천 상품 보기' }]);
                }
            })
            .catch(() => addLocalMessage('BOT', '추천 처리 중 오류가 발생했어요.'))
            .finally(resetMenu);
    }

    function handleDiagnosis() {
        addLocalMessage('BOT', '투자성향 진단 페이지로 이동할게요.', [{ path: '/investment-diagnosis', label: '진단하러 가기' }]);
        resetMenu();
    }

    function handleDiagnosisResult() {
        addLocalMessage('BOT', '진단 결과 페이지로 이동할게요.', [{ path: '/mypage/diagnosis/results', label: '진단 결과 보기' }]);
        resetMenu();
    }

    function handleGoal() {
        getGoals(TEMP_USER_ID)
            .then((goals) => {
                if (!goals || goals.length === 0) {
                    addLocalMessage('BOT', '설정된 재무목표가 없어요. 새로 등록해보시겠어요?', [{ path: '/mypage/financial-goals', label: '재무목표 보기' }]);
                } else {
                    addLocalMessage('BOT', `현재 ${goals.length}개의 재무목표가 진행 중이에요.`, [{ path: '/mypage/financial-goals', label: '재무목표 보기' }]);
                }
            })
            .catch(() => addLocalMessage('BOT', '재무목표 조회 중 오류가 발생했어요.'))
            .finally(resetMenu);
    }

    function handleMyProfile() {
        addLocalMessage('BOT', '회원정보 페이지로 이동할게요.', [{ path: '/mypage/profile', label: '회원정보 보기'}]);
        resetMenu();
    }

    function handleAccountList() {
        addLocalMessage('BOT', '계좌 관리 페이지로 이동할게요.', [{ path: '/mypage/accounts', label: '내 계좌 보기'}]);
        resetMenu();
    }

    function handleAccountNew() {
        addLocalMessage('BOT', '계좌 관리 페이지에서 새 계좌를 개설할 수 있어요.', [{ path: '/mypage/accounts', label: '계좌 개설하러 가기'}]);
        resetMenu();
    }

    function handleCardList() {
        addLocalMessage('BOT', '카드 관리 페이지로 이동할게요.', [{ path: '/mypage/cards', label: '내 카드 보기'}]);
        resetMenu();
    }

    function handleCardNew() {
        addLocalMessage('BOT', '카드 관리 페이지에서 새 카드를 발급할 수 있어요.', [{ path: '/mypage/cards', label: '카드 발급하러 가기' }]);
        resetMenu();
    }

    function handleFraudReportNew() {
        addLocalMessage('BOT', "거래 신고 관리 페이지로 이동할게요. 상단의 '새로운 거래 신고하기' 탭에서 신고할 수 있어요.", [{ path: '/mypage/fraud-reports', label: '신고하러 가기' }]);
        resetMenu();
    }

    function handleFraudReportHistory() {
        getMyFraudReports(TEMP_USER_ID)
            .then((reports) => {
                const count = reports?.length || 0;
                const message = count === 0
                    ? '접수하신 이상거래 신고 내역이 없어요.'
                    : `현재 접수하신 이상거래 신고가 ${count}건 있어요.`;
                addLocalMessage('BOT', message, [{ path: '/mypage/fraud-reports', label: '신고 내역 보기'}]);
            })
            .catch(() => addLocalMessage('BOT', '신고 내역 조회 중 오류가 발생했어요.', [{ path: '/mypage/fraud-reports', label: '신고 페이지로 이동'}]))
            .finally(resetMenu);
    }

    function handleLockRequestNew() {
        addLocalMessage('BOT', "잠금 요청 페이지로 이동할게요. 상단의 '새로운 잠금 신청하기' 탭에서 신청할 수 있어요.", [{ path: '/mypage/lock-requests', label: '잠금 신청하러 가기'}]);
        resetMenu();
    }

    function handleLockRequestHistory() {
        getMyLockRequests(TEMP_USER_ID)
            .then((requests) => {
                const count = requests?.length || 0;
                const message = count === 0
                    ? '신청하신 잠금 요청 내역이 없어요.'
                    : `현재 신청하신 잠금 요청이 ${count}건 있어요.`;
                addLocalMessage('BOT', message, [{ path: '/mypage/lock-requests', label: '잠금 요청 내역 보기'}]);
            })
            .catch(() => addLocalMessage('BOT', '잠금 요청 내역 조회 중 오류가 발생했어요.', [{ path: '/mypage/lock-requests', label: '잠금 요청 페이지로 이동'}]))
            .finally(resetMenu);
    }

    function handleCustomerService() {
        addLocalMessage('BOT', '상담원을 연결해드릴게요. 잠시만 기다려주세요.');
        connectAdmin();
        resetMenu();
    }

    function handleCustomerCenterPage() {
        addLocalMessage('BOT', '고객센터 페이지로 이동할게요. FAQ와 전화 상담 안내를 확인하실 수 있어요.', [{ path: '/support', label: '고객센터 보기'}]);
        resetMenu();
    }

    return { runAction };
}