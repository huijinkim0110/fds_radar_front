import { useEffect, useState } from "react";
import { getGoals, createGoal, updateCurrentAmount, cancelGoal } from "../../api/finance/financialGoalsAPI";
import { GOAL_TYPE_LABELS, GOAL_STATUS_LABELS } from "../../constants/finance/goalLabels";
import TopBar from "../TopBar";
import Panel from "../Panel";

const TEMP_USER_ID = 1; // 인증 붙기 전까지 임시 고정값

const GOAL_TYPE_OPTIONS = Object.keys(GOAL_TYPE_LABELS);

export default function FinancialGoalList() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        goalType: GOAL_TYPE_OPTIONS[0],
        goalName: '',
        targetAmount: '',
        targetDate: '',
        monthlyTargetAmount: ''
    });
    const [submitting, setSubmitting] = useState(false);

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
        setForm((prev) => ({ ...prev, [field]: value }));
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

    if (loading) {
        return <div style={styles.message}>불러오는 중...</div>;
    }

    if (error) {
        return <div style={styles.message}>{error}</div>;
    }

    return (
        <div style={styles.page}>
            <TopBar title="재무목표" crumb="홈 / 금융 / 재무목표" search={false} />

            {/* 목표 등록 폼 */}
            <Panel title="목표 등록" sub="새로운 재무목표를 설정하세요">
                <div style={styles.formGrid}>
                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>목표 종류</span>
                        <select
                            style={styles.input}
                            value={form.goalType}
                            onChange={(e) => handleFormChange('goalType', e.target.value)}
                        >
                            {GOAL_TYPE_OPTIONS.map((type) => (
                                <option key={type} value={type}>{GOAL_TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                    </label>

                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>목표명</span>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="예: 내 집 마련"
                            value={form.goalName}
                            onChange={(e) => handleFormChange('goalName', e.target.value)}
                        />
                    </label>

                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>목표금액</span>
                        <div style={styles.inputWithSuffix}>
                            <input
                                style={styles.input}
                                type="number"
                                value={form.targetAmount}
                                onChange={(e) => handleFormChange('targetAmount', e.target.value)}
                            />
                            <span style={styles.suffix}>원</span>
                        </div>
                    </label>

                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>목표일</span>
                        <input
                            style={styles.input}
                            type="date"
                            value={form.targetDate}
                            onChange={(e) => handleFormChange('targetDate', e.target.value)}
                        />
                    </label>

                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>월 목표 저축액 (선택)</span>
                        <div style={styles.inputWithSuffix}>
                            <input
                                style={styles.input}
                                type="number"
                                value={form.monthlyTargetAmount}
                                onChange={(e) => handleFormChange('monthlyTargetAmount', e.target.value)}
                            />
                            <span style={styles.suffix}>원</span>
                        </div>
                    </label>
                </div>

                <div style={styles.formActions}>
                    <button
                        type="button"
                        className="minibtn"
                        onClick={handleCreate}
                        disabled={submitting}
                        style={styles.primaryButton}
                    >
                        {submitting ? '등록 중...' : '목표 등록'}
                    </button>
                </div>
            </Panel>

            {/* 목표 목록 */}
            <div style={{ marginTop: 20 }}>
                <Panel title="목표 목록" sub="설정한 재무목표의 진행 현황입니다">
                    {goals.length === 0 ? (
                        <div style={styles.empty}>등록된 재무목표가 없습니다.</div>
                    ) : (
                        <div style={styles.goalList}>
                            {goals.map((goal) => {
                                const isInProgress = goal.goalStatus === 'IN_PROGRESS';
                                const rate = Math.min(goal.achievementRate ?? 0, 100);

                                return (
                                    <div key={goal.goalId} style={styles.goalCard}>
                                        <div style={styles.goalHeader}>
                                            <div>
                                                <div style={styles.goalName}>{goal.goalName}</div>
                                                <div style={styles.goalMeta}>
                                                    {GOAL_TYPE_LABELS[goal.goalType]}
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    ...styles.statusBadge,
                                                    background: isInProgress
                                                        ? 'var(--blue)'
                                                        : 'var(--green)',
                                                }}
                                            >
                                                {GOAL_STATUS_LABELS[goal.goalStatus]}
                                            </span>
                                        </div>

                                        <div style={styles.progressRow}>
                                            <div style={styles.progressTrack}>
                                                <div
                                                    style={{
                                                        ...styles.progressFill,
                                                        width: `${rate}%`,
                                                    }}
                                                />
                                            </div>
                                            <span style={styles.progressLabel}>{rate}%</span>
                                        </div>

                                        <div style={styles.goalInfoGrid}>
                                            <InfoRow label="목표금액" value={`${goal.targetAmount?.toLocaleString()}원`} />
                                            <InfoRow label="현재금액" value={`${goal.currentAmount?.toLocaleString()}원`} />
                                            {goal.monthlyTargetAmount != null && (
                                                <InfoRow label="월 목표 저축액" value={`${goal.monthlyTargetAmount.toLocaleString()}원`} />
                                            )}
                                            <InfoRow label="목표일" value={goal.targetDate?.slice(0, 10)} />
                                        </div>

                                        {editingGoalId === goal.goalId ? (
                                            <div style={styles.editRow}>
                                                <input
                                                    style={styles.editInput}
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={(e) => setEditAmount(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="minibtn"
                                                    style={styles.primaryButtonSmall}
                                                    onClick={() => handleSaveAmount(goal.goalId)}
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    type="button"
                                                    className="minibtn"
                                                    style={styles.secondaryButtonSmall}
                                                    onClick={() => setEditingGoalId(null)}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            isInProgress && (
                                                <div style={styles.actionRow}>
                                                    <button
                                                        type="button"
                                                        className="minibtn"
                                                        style={styles.secondaryButtonSmall}
                                                        onClick={() => handleStartEdit(goal)}
                                                    >
                                                        진행금액 수정
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="minibtn"
                                                        style={styles.dangerButtonSmall}
                                                        onClick={() => handleCancelGoal(goal.goalId)}
                                                    >
                                                        목표 취소
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={styles.infoRow}>
            <span style={styles.infoLabel}>{label}</span>
            <span style={styles.infoValue}>{value}</span>
        </div>
    );
}

const styles = {
    page: {
        width: '100%',
        maxWidth: 1180,
        margin: '0 auto',
        padding: '32px 24px 60px',
        boxSizing: 'border-box',
    },
    message: {
        padding: '60px 0',
        textAlign: 'center',
        color: 'var(--muted)',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    fieldLabel: {
        fontSize: '12px',
        color: 'var(--muted)',
        fontWeight: 600,
    },
    input: {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'var(--ink)',
        background: '#fff',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    },
    inputWithSuffix: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    suffix: {
        fontSize: '13px',
        color: 'var(--muted)',
        flexShrink: 0,
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '20px',
        paddingTop: '18px',
        borderTop: '1px solid var(--line)',
    },
    primaryButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '9px',
        background: 'var(--blue)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    primaryButtonSmall: {
        padding: '7px 14px',
        border: 'none',
        borderRadius: '8px',
        background: 'var(--blue)',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    secondaryButtonSmall: {
        padding: '7px 14px',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        background: 'transparent',
        color: 'var(--ink)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    dangerButtonSmall: {
        padding: '7px 14px',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '8px',
        background: 'transparent',
        color: '#ef4444',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    empty: {
        padding: '40px 0',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '13px',
    },
    goalList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    goalCard: {
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid var(--line)',
        background: 'var(--panel2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    goalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    goalName: {
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--ink)',
    },
    goalMeta: {
        marginTop: '4px',
        fontSize: '12px',
        color: 'var(--muted)',
    },
    statusBadge: {
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
    },
    progressRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    progressTrack: {
        flex: 1,
        height: '8px',
        borderRadius: '999px',
        background: 'var(--line)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '999px',
        background: 'var(--blue)',
    },
    progressLabel: {
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--blue)',
        width: '38px',
        textAlign: 'right',
        flexShrink: 0,
    },
    goalInfoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '8px 20px',
        paddingTop: '12px',
        borderTop: '1px solid var(--line)',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
    },
    infoLabel: {
        color: 'var(--muted)',
    },
    infoValue: {
        color: 'var(--ink)',
        fontWeight: 700,
    },
    editRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid var(--line)',
    },
    editInput: {
        flex: 1,
        padding: '8px 12px',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: 'inherit',
    },
    actionRow: {
        display: 'flex',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--line)',
    },
};