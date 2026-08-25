import { useEffect, useState } from "react";
import { getGoals, createGoal, updateCurrentAmount, cancelGoal } from "../../api/finance/financialGoalsAPI";
import { GOAL_TYPE_LABELS, GOAL_STATUS_LABELS } from "../../constants/finance/goalLabels";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

const GOAL_TYPE_OPTIONS = Object.keys(GOAL_TYPE_LABELS);

function FinancialGoalList() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 등록 폼 상태
    const [form, setForm] = useState({
        goalType: GOAL_TYPE_OPTIONS[0],
        goalName: '',
        targetAmount: '',
        targetDate: '', 
        monthlyTargetAmount: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // 진행금액 수정 중인 목표 id와 입력값 설정
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [editAmount, setEditAmount] = useState('');

    function loadGoals() {
        setLoading(true);
        setError(null);
        getGoals(TEMP_USER_ID)
            .then(setGoals)
            .catch(() => setError('재무목표를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadGoals();
    }, []);

    function handleFormChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value}));
    }

    function handleCreate() {
        if (!form.goalName || !form.targetAmount || !form.targetDate) {
            alert('목표명, 목표금액, 목표일을 입력해주세요.');
            return;
        }

        setSubmitting(true);
        createGoal({
            userId: TEMP_USER_ID,
            goalType: form.goalType,
            goalName: form.goalName,
            targetAmount: Number(form.targetAmount),
            targetDate: `${form.targetDate}T00:00:00`,
            monthlyTargetAmount: form.monthlyTargetAmount ? Number(form.monthlyTargetAmount) : null,
        })
            .then(() => {
                setForm({
                    goalType: GOAL_TYPE_OPTIONS[0],
                    goalName: '',
                    targetAmount: '',
                    targetDate: '',
                    monthlyTargetAmount: ''
                });
                loadGoals();
            })
            .catch(() => alert('목표 등록에 실패했습니다.'))
            .finally(() => setSubmitting(false));
    }

    function handleStartEdit(goal) {
        setEditingGoalId(goal.goalId);
        setEditAmount(String(goal.currentAmount ?? 0));
    }

    function handleSaveAmount(goalId) {
        updateCurrentAmount(goalId, Number(editAmount))
            .then(() => {
                setEditingGoalId(null);
                loadGoals();
            })
            .catch(() => alert('진행금액 수정에 실패했습니다.'));
    }

    function handleCancelGoal(goalId) {
        if (!window.confirm('이 목표를 취소하시겠습니까?')) return;

        cancelGoal(goalId)
            .then(() => loadGoals())
            .catch(() => alert('목표 취소에 실패했습니다.'));
    }

    if (loading) return <div>불러오는 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>재무목표</h2>

            {/* 목표 등록 폼 */}
            <div>
                <h3>목표 등록</h3>
                <label>
                    목표 종류
                    <select value={form.goalType} onChange={(e) => handleFormChange('goalType', e.target.value)}>
                        {GOAL_TYPE_OPTIONS.map((type) => (
                            <option key={type} value={type}>{GOAL_TYPE_LABELS[type]}</option>
                        ))}
                    </select>
                </label>

                <label>
                    목표명
                    <input
                        type="text"
                        value={form.goalName}
                        onChange={(e) => handleFormChange('goalName', e.target.value)}
                    />
                </label>

                <label>
                    목표금액
                    <input 
                        type="number"
                        value={form.targetAmount}
                        onChange={(e) => handleFormChange('targetAmount', e.target.value)}
                    />원
                </label>

                <label>
                    목표일
                    <input 
                        type="date"
                        value={form.targetDate}
                        onChange={(e) => handleFormChange('targetDate', e.target.value)}
                    />
                </label>

                <label>
                    월 목표 저축액 (선택)
                    <input 
                        type="number"
                        value={form.monthlyTargetAmount}
                        onChange={(e) => handleFormChange('monthlyTargetAmount', e.target.value)}
                    />원
                </label>

                <button onClick={handleCreate} disabled={submitting}>
                    {submitting ? '등록 중...' : '목표 등록'}
                </button>
            </div>

            {/* 목표 목록 */}
            {goals.length === 0 ? (
                <div>등록된 재무목표가 없습니다.</div>
            ) : (
                <div>
                    {goals.map((goal) => (
                        <div key={goal.goalId}>
                            <h3>{goal.goalName}</h3>
                            <p>{GOAL_TYPE_LABELS[goal.goalType]} · {GOAL_STATUS_LABELS[goal.goalStatus]}</p>
                            <p>목표금액: {goal.targetAmount?.toLocaleString()}원</p>
                            <p>현재금액: {goal.currentAmount?.toLocaleString()}원</p>
                            <p>달성률: {goal.achievementRate}%</p>
                            {goal.monthlyTargetAmount != null && (
                                <p>월 목표 저축액: {goal.monthlyTargetAmount.toLocaleString()}원</p>
                            )}
                            <p>목표일: {goal.targetDate?.slice(0, 10)}</p>

                            {editingGoalId === goal.goalId ? (
                                <div>
                                    <input 
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                    />
                                    <button onClick={() => handleSaveAmount(goal.goalId)}>저장</button>
                                    <button onClick={() => setEditingGoalId(null)}>취소</button>
                                </div>
                            ) : (
                                goal.goalStatus === 'IN_PROGRESS' && (
                                    <div>
                                        <button onClick={() => handleStartEdit(goal)}>진행금액 수정</button>
                                        <button onClick={() => handleCancelGoal(goal.goalId)}>목표 취소</button>
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FinancialGoalList;