import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetail } from '../../api/financialProduct/productAPI';
import { checkSuitability } from '../../api/recommendation/suitabilityCheckAPI';
import { hasDiagnosisHistory } from '../../api/finance/investmentProfileAPI';
import { PRODUCT_TYPE_LABELS } from '../../constants/financialProduct/productLabels';
import FavoriteButton from './FavoriteButton';
import CompareButton from './CompareButton';
import SubscribeForm from './SubscribeForm';
import TopBar from '../TopBar.jsx';
import Panel from '../Panel.jsx';

const TEMP_USER_ID = 1;

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [gateStep, setGateStep] = useState('idle');
  const [checkResult, setCheckResult] = useState(null);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getProductDetail(productId)
      .then(setProduct)
      .catch(() => setError('상품 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleStartSubscribe() {
    setGateStep('checking');
    setRiskAcknowledged(false);

    try {
      const hasHistory = await hasDiagnosisHistory(TEMP_USER_ID);

      if (!hasHistory) {
        setGateStep('needsDiagnosis');
        return;
      }

      const result = await checkSuitability(TEMP_USER_ID, productId);

      setCheckResult(result);
      setGateStep(
        result.suitabilityResult === 'SUITABLE' ? 'suitable' : 'unsuitable'
      );
    } catch {
      alert('적합성 검사에 실패했습니다.');
      setGateStep('idle');
    }
  }

  if (loading) {
    return <div style={styles.message}>상품 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div style={styles.message}>{error}</div>;
  }

  if (!product) return null;

  const productType =
    PRODUCT_TYPE_LABELS[product.productType] ?? product.productType;

  const period =
    product.subscriptionPeriod != null
      ? `${product.subscriptionPeriod}개월`
      : '-';

  const returnRate =
    product.expectedReturnRate != null
      ? `${product.expectedReturnRate}%`
      : '-';

  const minAmount =
    product.minAmount != null
      ? `${product.minAmount.toLocaleString()}원`
      : '제한없음';

  const maxAmount =
    product.maxAmount != null
      ? `${product.maxAmount.toLocaleString()}원`
      : '제한없음';

  return (
    <div style={styles.page}>
      <TopBar
        title="금융 상품 상세"
        crumb={`홈 / 금융 상품 / ${product.productName}`}
        search={false}
      />

      <button
        type="button"
        style={styles.backButton}
        onClick={() => navigate('/products', { replace: true })}
      >
        ← 금융상품 목록
      </button>

      {/* 상품 상단 */}
      <div style={styles.hero}>
        <div style={styles.productSummary}>
          <span style={styles.typeBadge}>{productType}</span>

          <div style={styles.titleRow}>
            <h1 style={styles.title}>{product.productName}</h1>
            <FavoriteButton userId={TEMP_USER_ID} productId={productId} />
          </div>

          <div style={styles.institution}>{product.institutionName}</div>
        </div>

        <div style={styles.rateArea}>
          <div style={styles.rateLabel}>예상 수익률</div>
          <div style={styles.rate}>{returnRate}</div>

          <div style={styles.summaryGrid}>
            <SummaryItem label="가입 기간" value={period} />
            <SummaryItem
              label="원금 보장"
              value={product.principalProtection ? '보장' : '비보장'}
              highlight={product.principalProtection}
            />
            <SummaryItem
              label="가입 금액"
              value={`${minAmount} ~ ${maxAmount}`}
            />
          </div>

          <div style={styles.actionRow}>
            <CompareButton productId={productId} />

            {gateStep === 'idle' && (
              <button
                type="button"
                style={styles.subscribeButton}
                onClick={handleStartSubscribe}
              >
                가입하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 상품 정보 */}
      <div style={{ marginTop: 20 }}>
        <Panel title="상품 정보" sub="상품의 주요 내용을 확인하세요">
          <div style={styles.infoGrid}>
            <InfoRow label="상품 유형" value={productType} />
            <InfoRow label="가입 기간" value={period} />
            <InfoRow
              label="원금 보장"
              value={product.principalProtection ? '보장' : '비보장'}
            />
            <InfoRow
              label="가입 금액"
              value={`${minAmount} ~ ${maxAmount}`}
            />
            <InfoRow
              label="예상 수익률"
              value={
                product.expectedReturnRate != null
                  ? `연 ${product.expectedReturnRate}%`
                  : '-'
              }
            />
          </div>

          <div style={styles.description}>
            <div style={styles.descriptionTitle}>상품 설명</div>
            <div style={styles.descriptionText}>
              {product.description || '등록된 상품 설명이 없습니다.'}
            </div>
          </div>
        </Panel>
      </div>

      {/* 가입 과정 */}
      {gateStep !== 'idle' && (
        <div style={{ marginTop: 20 }}>
          <Panel title="상품 가입">
            {gateStep === 'checking' && (
              <div style={styles.gateMessage}>적합성 검사 중...</div>
            )}

            {gateStep === 'needsDiagnosis' && (
              <div>
                <p style={styles.gateText}>
                  투자성향 진단 이력이 없습니다. 먼저 진단을 진행해주세요.
                </p>

                <div style={styles.buttonRow}>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={() => navigate('/mypage/diagnosis')}
                  >
                    진단하러 가기
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => setGateStep('idle')}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {gateStep === 'suitable' && (
              <>
                {checkResult?.goalNote && <p>ℹ {checkResult.goalNote}</p>}
                <SubscribeForm userId={TEMP_USER_ID} product={product} />
              </>
            )}

            {gateStep === 'unsuitable' && (
              <div>
                <div style={styles.warningBox}>
                  <strong>이 상품은 회원님의 투자성향과 맞지 않습니다.</strong>
                  <p style={styles.warningText}>{checkResult?.checkReason}</p>
                  {checkResult?.goalNote && <p>ℹ {checkResult.goalNote}</p>}
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={riskAcknowledged}
                    onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  />
                  위 내용을 확인했으며, 그럼에도 가입을 진행하겠습니다.
                </label>

                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => {
                    setGateStep('idle');
                    setRiskAcknowledged(false);
                  }}
                >
                  가입 취소
                </button>

                {riskAcknowledged && (
                  <div style={{ marginTop: 20 }}>
                    <SubscribeForm userId={TEMP_USER_ID} product={product} />
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value, highlight = false }) {
  return (
    <div style={styles.summaryItem}>
      <div style={styles.summaryLabel}>{label}</div>
      <div
        style={{
          ...styles.summaryValue,
          color: highlight ? 'var(--green)' : 'var(--ink)',
        }}
      >
        {value}
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
  backButton: {
    margin: '18px 0 16px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: 'var(--muted)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '0.9fr 1.3fr',
    gap: 36,
    padding: 30,
    border: '1px solid var(--line)',
    borderRadius: 18,
    background: 'var(--panel)',
  },
  productSummary: {
    paddingRight: 28,
    borderRight: '1px solid var(--line)',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '5px 10px',
    marginBottom: 16,
    borderRadius: 999,
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--blue)',
    fontSize: 12,
    fontWeight: 700,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.3,
    color: 'var(--ink)',
  },
  institution: {
    marginTop: 8,
    color: 'var(--muted)',
    fontSize: 14,
  },
  rateArea: {
    minWidth: 0,
  },
  rateLabel: {
    marginBottom: 5,
    color: 'var(--muted)',
    fontSize: 12,
  },
  rate: {
    marginBottom: 24,
    color: 'var(--blue)',
    fontSize: 40,
    fontWeight: 800,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    padding: '17px 0',
    borderTop: '1px solid var(--line)',
    borderBottom: '1px solid var(--line)',
  },
  summaryItem: {
    padding: '0 16px',
    borderRight: '1px solid var(--line)',
  },
  summaryLabel: {
    marginBottom: 5,
    color: 'var(--muted)',
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 20,
  },
  subscribeButton: {
    height: 42,
    border: 'none',
    borderRadius: 10,
    background: 'var(--blue)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    columnGap: 40,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20,
    padding: '14px 0',
    borderBottom: '1px solid var(--line)',
  },
  infoLabel: {
    color: 'var(--muted)',
    fontSize: 13,
  },
  infoValue: {
    color: 'var(--ink)',
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'right',
  },
  description: {
    marginTop: 28,
    paddingTop: 22,
    borderTop: '1px solid var(--line)',
  },
  descriptionTitle: {
    marginBottom: 10,
    color: 'var(--ink)',
    fontSize: 15,
    fontWeight: 700,
  },
  descriptionText: {
    color: 'var(--muted)',
    fontSize: 14,
    lineHeight: 1.8,
    whiteSpace: 'pre-line',
  },
  gateMessage: {
    padding: '18px 0',
    color: 'var(--muted)',
    fontSize: 14,
  },
  gateText: {
    margin: '0 0 16px',
    color: 'var(--ink)',
    fontSize: 14,
  },
  buttonRow: {
    display: 'flex',
    gap: 10,
  },
  primaryButton: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: 9,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '10px 18px',
    border: '1px solid var(--line)',
    borderRadius: 9,
    background: 'transparent',
    color: 'var(--ink)',
    cursor: 'pointer',
  },
  warningBox: {
    padding: '14px 16px',
    marginBottom: 16,
    borderRadius: 10,
    background: 'rgba(245, 158, 11, 0.08)',
    color: 'var(--ink)',
  },
  warningText: {
    margin: '6px 0 0',
    color: 'var(--muted)',
    fontSize: 13,
    lineHeight: 1.6,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
    color: 'var(--ink)',
    fontSize: 13,
  },
};