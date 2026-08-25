import { NavLink, Outlet } from "react-router-dom";

const MENU_GROUPS = [
    { type: 'single', path: 'dashboard', label:'대시보드' },
    {
        type: 'group',
        label: '계좌·카드',
        children: [
            { path: 'accounts', label: '계좌 관리' },
            { path: 'cards', label: '카드 관리' },
            { path: 'transactions', label: '거래내역' },
        ],
    },
    {
        type: 'group',
        label: '보안·신고',
        children: [
            { path: 'fraud-confirmations', label: '이상거래 확인' },
            { path: 'fraud-reports', label: '거래 신고' },
            { path: 'disputes', label: '이의제기' },
            { path: 'lock-requests', label: '계좌·카드 잠금 요청' }
        ],
    },
    {
        type: 'group',
        label: '자산관리', 
        children: [
            { path: 'financial-profile', label: '재무 프로필' },
            { path: 'favorites', label: '관심상품' },
            { path: 'comparisons', label: '비교상품' },
        ],
    },
    {
        type: 'group',
        label: '내 투자성향',
        children: [
            { path: 'diagnosis', label: '투자성향 진단' },
            { path: 'diagnosis/results', label: '진단 결과' },
            { path: 'recommendations', label: '추천 상품' },
        ],
    },
    {
        type: 'group',
        label: '내 정보',
        children: [
            { path: 'profile', label: '회원정보' },
            { path: 'devices', label: '로그인 기기·이력' },
            { path: 'notifications', label: '알림' },
        ],
    },
];

function MyPageLayout() {
    return (
        <div>
            <header>
                <h1>마이페이지</h1>
            </header>

            <div style={{ display: 'flex' }}>
                <nav>
                    <ul>
                        {MENU_GROUPS.map((item) => 
                            item.type === 'single' ? (
                                <li key={item.path}>
                                    <NavLink to={item.path}>{item.label}</NavLink>
                                </li>
                            ) : (
                                <li key={item.label}>
                                    <span>{item.label}</span>
                                    <ul>
                                        {item.children.map((child) => (
                                            <li key={child.path}>
                                                <NavLink to={child.path}>{child.label}</NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            )
                        )}
                    </ul>
                </nav>

                <main style={{ flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MyPageLayout;