import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignableAdmins, getAdminDashboard, getMyCases } from "../../api/fraud/fraudCaseAPI";
import {
    getCaseStatusLabel,
    getCasePriorityLabel,
    formatProbabilityPercent,
    formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";
import LockRequestApprovalModal from "./LockRequestApprovalModal";
import FraudAnalysis from "../fraud/FraudAnalysis";

// 관리자 마이페이지
// TODO(로그인 기능 붙으면 수정): 지금은 로그인이 없어서 "나는 누구인지"를
// 드롭다운으로 직접 선택하게 해뒀음. 로그인 붙으면 이 드롭다운 대신
// 로그인한 관리자 정보를 바로 쓰면 됨 (아래 selectedAdminId 자리를 교체).
function AdminMyPage() {
    const navigate = useNavigate();

    const [admins, setAdmins] = useState([]);
    const [selectedAdminId, setSelectedAdminId] = useState("");

    const [dashboard, setDashboard] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState(null);

    const [myCases, setMyCases] = useState([]);
    const [casesLoading, setCasesLoading] = useState(false);
    const [casesError, setCasesError] = useState(null);

    const [showLockModal, setShowLockModal] = useState(false);

    async function fetchAdmins() {
        try {
            const data = await getAssignableAdmins();
            setAdmins(data);
        } catch (err) {
            console.error("관리자 목록 조회 실패", err);
        }
    }

    async function fetchDashboard(adminId) {
        setDashboardLoading(true);
        setDashboardError(null);
        try {
            const data = await getAdminDashboard(adminId);
            setDashboard(data);
        } catch (err) {
            setDashboardError("대시보드를 불러오지 못했습니다.");
        } finally {
            setDashboardLoading(false);
        }
    }

    async function fetchMyCases(adminId) {
        setCasesLoading(true);
        setCasesError(null);
        try {
            const data = await getMyCases(adminId);
            setMyCases(data);
        } catch (err) {
            setCasesError("담당 사건 목록을 불러오지 못했습니다.");
        } finally {
            setCasesLoading(false);
        }
    }

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        if (selectedAdminId) {
            fetchDashboard(Number(selectedAdminId));
            fetchMyCases(Number(selectedAdminId));
        } else {
            setDashboard(null);
            setMyCases([]);
        }
    }, [selectedAdminId]);

    return (
        <div>
            <h2>관리자 마이페이지</h2>

            <section>
                <h3>내 정보 (임시 선택)</h3>
                <select
                    value={selectedAdminId}
                    onChange={(e) => setSelectedAdminId(e.target.value)}
                >
                    <option value="">관리자 선택</option>
                    {admins.map((admin) => (
                        <option key={admin.userId} value={admin.userId}>
                            {admin.name} (ID: {admin.userId})
                        </option>
                    ))}
                </select>
            </section>

            <section>
                <h3>대시보드</h3>
                {!selectedAdminId && <p>관리자를 선택하면 대시보드가 표시됩니다.</p>}
                {selectedAdminId && dashboardLoading && <p>불러오는 중...</p>}
                {selectedAdminId && dashboardError && <p>{dashboardError}</p>}
                {selectedAdminId && !dashboardLoading && !dashboardError && dashboard && (
                    <div>
                        <p>배정받은 사건 수 (진행 중): {dashboard.assignedCaseCount}건</p>
                        <p>오늘 접수된 사건 수 (전체): {dashboard.todayReceivedCaseCount}건</p>
                        <div>
                            <p>처리 현황 요약</p>
                            <ul>
                                <li>접수: {dashboard.receivedCaseCount}건</li>
                                <li>조사중: {dashboard.investigatingCaseCount}건</li>
                                <li>종결: {dashboard.closedCaseCount}건</li>
                            </ul>
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h3>내 담당 사건 목록</h3>
                {!selectedAdminId && <p>관리자를 선택하면 목록이 표시됩니다.</p>}
                {selectedAdminId && casesLoading && <p>불러오는 중...</p>}
                {selectedAdminId && casesError && <p>{casesError}</p>}
                {selectedAdminId && !casesLoading && !casesError && myCases.length === 0 && (
                    <p>담당 중인 사건이 없습니다.</p>
                )}
                {selectedAdminId && !casesLoading && !casesError && myCases.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>사건ID</th>
                                <th>거래ID</th>
                                <th>이상확률</th>
                                <th>우선순위</th>
                                <th>상태</th>
                                <th>접수일시</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {myCases.map((c) => (
                                <tr key={c.fraudCaseId}>
                                    <td>{c.fraudCaseId}</td>
                                    <td>{c.transactionId}</td>
                                    <td>{formatProbabilityPercent(c.fraudProbability)}</td>
                                    <td>{getCasePriorityLabel(c.priority)}</td>
                                    <td>{getCaseStatusLabel(c.caseStatus)}</td>
                                    <td>{formatDateTime(c.openedAt)}</td>
                                    <td>
                                        <button onClick={() => navigate(`/admin/fraud-cases/${c.fraudCaseId}`)}>
                                            상세보기
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section>
                <FraudAnalysis />
            </section>

            <section>
                <h3>잠금 요청 이력</h3>
                <button onClick={() => setShowLockModal(true)}>처리 대기 목록 보기</button>
            </section>

            {showLockModal && (
                <LockRequestApprovalModal onClose={() => setShowLockModal(false)} />
            )}

            <section>
                <h3>내 정보</h3>
                <p>준비 중 — 회원/인증 담당 팀원 확인 후 연결 예정</p>
            </section>

            <section>
                <h3>관리자정보</h3>
                <p>준비 중 — 회원/인증 담당 팀원 확인 후 연결 예정</p>
            </section>

            <section>
                <h3>로그인 기기·이력</h3>
                <p>준비 중 — 회원/인증 담당 팀원 확인 후 연결 예정</p>
            </section>

            <section>
                <h3>알림</h3>
                <p>준비 중 — 회원/인증 담당 팀원 확인 후 연결 예정</p>
            </section>
        </div>
    );
}

export default AdminMyPage;