import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFraudCaseList } from "../../api/fraud/fraudCaseAPI";
import {
    getCaseStatusLabel,
    getCasePriorityLabel,
    formatProbabilityPercent,
    formatDateTime,
} from "../../constants/fraud/fraudCaseLabels";

function FraudCaseList() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCases() {
            try {
                const data = await getFraudCaseList();
                setCases(data.content); // Spring Page 응답은 실제 목록이 content 안에 있음
            } catch (err) {
                setError("사건 목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        }
        fetchCases();
    }, []);

    if (loading) return <div>불러오는 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>이상거래 사건 목록</h2>
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
                    {cases.map((c) => (
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
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FraudCaseList;