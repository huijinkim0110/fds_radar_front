import { useNavigate } from "react-router-dom";
import Panel from "../Panel";

// 추천 상품 리스트만 보여주는 프레젠테이션 컴포넌트
// - 데이터 조회, 재무목표 경고, 이력 관리는 부모(DiagnosisResults)가 담당
export default function RecommendedProducts({ results }) {
    const navigate = useNavigate();

    return (
        <Panel title="추천 결과 리스트" sub="분석 완료된 맞춤 상품 목록입니다.">
            {!results ? (
                <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                    <strong>'추천 받기'</strong> 버튼을 눌러 상품을 확인해보세요!
                </div>
            ) : results.length === 0 ? (
                <div style={{ padding: "50px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                    현재 조건에 맞는 추천 상품이 없어요.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {results.map((item) => (
                        <div
                            key={item.productId}
                            onClick={() => navigate(`/products/${item.productId}`)}
                            style={{
                                padding: "16px 20px",
                                borderRadius: "10px",
                                border: "1px solid var(--line)",
                                background: "var(--panel2)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--ink)" }}>
                                {item.productName}
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "2px"}}>매칭 점수</div>
                                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--blue)"}}>
                                    {item.score?.toFixed(2)}점
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}