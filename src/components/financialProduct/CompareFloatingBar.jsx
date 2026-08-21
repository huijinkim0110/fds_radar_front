import { useNavigate } from "react-router-dom";
import { useComparison } from "../../context/ComparisonContext";

export default function CompareFloatingBar() {
    const { items, maxItems } = useComparison();
    const navigate = useNavigate();

    if (items.length === 0) return null;

    return (
        <div>
            <span>비교함 ({items.length}/{maxItems})</span>
            <button type="button" onClick={() => navigate('/mypage/comparisons')}>
                비교하기
            </button>
        </div>
    );
}