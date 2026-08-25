import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFalsePositives, getFalseNegatives } from "../../api/fraud/fraudAnalysisAPI";
import {
    getCaseStatusLabel,
    getCasePriorityLabel,
    formatProbabilityPercent,
    formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";

function FraudAnalysis() {
    const [tab, setTab] = useState("false-positive"); // "false-positive" 또는 "false-negative"
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCases() {
            setLoading(true);
            setError(null);
            try {
                const data =
                    tab === "false-positive"
                        ? await getFalsePositives()
                        : await getFalseNegatives();
                setCases(data);
            } catch (err) {
                setError("목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        }
        fetchCases();
    }, [tab]);

    return (
        <div>
            <h2>오탐·미탐 조회</h2>

            <div>
                <button onClick={() => setTab("false-positive")} disabled={tab === "false-positive"}>
                    오탐 (AI: 이상 → 최종: 정상)
                </button>
                <button onClick={() => setTab("false-negative")} disabled={tab === "false-negative"}>
                    미탐 (AI: 정상 → 최종: 사기)
                </button>
            </div>

            {loading && <div>불러오는 중...</div>}
            {error && <div>{error}</div>}

            {!loading && !error && (
                <table>
                    <thead>
                        <tr>
                            <th>사건ID</th>
                            <th>거래ID</th>
                            <th>이상확률</th>
                            <th>우선순위</th>
                            <th>상태</th>
                            <th>담당자</th>
                            <th>접수일시</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.length === 0 ? (
                            <tr>
                                <td colSpan="7">해당하는 사건이 없습니다.</td>
                            </tr>
                        ) : (
                            cases.map((c) => (
                                <tr
                                    key={c.fraudCaseId}
                                    onClick={() => navigate(`/admin/fraud-cases/${c.fraudCaseId}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{c.fraudCaseId}</td>
                                    <td>{c.transactionId}</td>
                                    <td>{formatProbabilityPercent(c.fraudProbability)}</td>
                                    <td>{getCasePriorityLabel(c.priority)}</td>
                                    <td>{getCaseStatusLabel(c.caseStatus)}</td>
                                    <td>{c.assignedAdminId}</td>
                                    <td>{formatDateTime(c.openedAt)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FraudAnalysis;