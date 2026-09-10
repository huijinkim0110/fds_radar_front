import { useState } from "react";
import TopBar from "./TopBar.jsx";
import Panel from "./Panel.jsx";
import { useNavigate } from "react-router-dom";

const FAQS = [
  {
    q: "실시간 이상거래 탐지(FDS)는 어떻게 작동하나요?",
    a: "Wonly는 24시간 동안 고객님의 거래 패턴을 AI로 실시간 모니터링하여 평소와 다른 이상 거래가 감지될 경우 즉시 차단하고 알림을 보냅니다.",
  },
  {
    q: "송금 후 잔액이 바로 반영되지 않아요.",
    a: "일반적으로 송금은 즉시 처리되나, 은행 네트워크 상황에 따라 1~2분 정도 소요될 수 있습니다. 지속될 경우 고객센터로 문의해주세요.",
  },
  {
    q: "투자성향 진단은 꼭 해야 하나요?",
    a: "소액 투자 등 일부 고위험 금융 상품 이용 시 고객님의 안전한 투자를 위해 사전 진단이 권장됩니다.",
  },
  {
    q: "비밀번호를 잊어버렸어요.",
    a: "로그인 화면 하단의 '비밀번호 찾기'를 통해 본인 인증 후 재설정하실 수 있습니다.",
  },
  {
    q: "이상거래가 탐지되면 어떻게 알 수 있나요?",
    a: "이상거래가 탐지되면 알림을 통해 관련 내용을 확인할 수 있으며, 필요에 따라 거래가 제한될 수 있습니다.",
  },
  {
    q: "거래가 차단되었는데 어떻게 해야 하나요?",
    a: "이상거래로 판단되어 거래가 차단된 경우 알림 내용을 확인한 후 본인 거래 여부를 확인해주세요. 추가 확인이 필요한 경우 고객센터로 문의해주세요.",
  },
  {
    q: "제가 하지 않은 거래가 발생했어요.",
    a: "본인이 진행하지 않은 거래가 확인될 경우 즉시 거래 내역을 확인하고 고객센터를 통해 신고해주세요.",
  },
  {
    q: "잘못 송금했어요. 취소할 수 있나요?",
    a: "송금이 완료된 이후에는 바로 취소하기 어려울 수 있습니다. 잘못 송금한 경우 고객센터를 통해 반환 절차를 문의해주세요.",
  },
  {
    q: "금융상품은 어떻게 비교하나요?",
    a: "금융상품 목록에서 비교 버튼을 눌러 비교함에 추가할 수 있으며, 최대 3개의 금융상품을 한 번에 비교할 수 있습니다.",
  },
  {
    q: "관심 있는 금융상품을 저장할 수 있나요?",
    a: "금융상품에 표시된 별표 버튼을 누르면 관심상품으로 등록할 수 있습니다.",
  },
  {
    q: "로그인 기록은 어디에서 확인할 수 있나요?",
    a: "마이페이지에서 최근 로그인 기록과 접속 정보를 확인할 수 있습니다. 본인이 사용하지 않은 접속 기록이 있다면 고객센터로 문의해주세요.",
  },
  {
    q: "회원정보는 어디에서 수정하나요?",
    a: "마이페이지의 회원정보 메뉴에서 등록된 이름, 전화번호 등 회원정보를 확인하거나 수정할 수 있습니다.",
  },
  {
    q: "송금이 실패했는데 잔액이 줄어들었어요.",
    a: "송금 처리 중 오류가 발생한 경우 일시적으로 잔액이 다르게 표시될 수 있습니다. 잠시 후 다시 확인해주시고, 잔액이 복구되지 않을 경우 고객센터로 문의해주세요.",
  },
  {
    q: "비밀번호는 어떻게 변경하나요?",
    a: "마이페이지의 회원정보 또는 보안 설정 메뉴에서 현재 비밀번호를 확인한 후 새로운 비밀번호로 변경할 수 있습니다.",
  },
  {
    q: "고객센터 상담은 어떻게 이용하나요?",
    a: "고객센터 화면의 1:1 채팅 문의 또는 전화 상담을 통해 문의할 수 있습니다. 전화 상담은 평일 09:00부터 18:00까지 이용할 수 있습니다.",
  },
];

/* 한글 초성 */
const INITIALS = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

/* 글자 하나의 초성 가져오기 */
const getInitial = (char) => {
  const code = char.charCodeAt(0);

  if (code >= 0xac00 && code <= 0xd7a3) {
    const index = Math.floor((code - 0xac00) / 588);
    return INITIALS[index];
  }

  return char.toLowerCase();
};

/* 검색할 때 공백/특수문자 제거 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-z0-9]/g, "");
};

/*
  질문 검색

  1. 일반 단어 검색
  2. 초성 검색
  3. 답변은 검색하지 않음
*/
const getQuestionMatch = (question, searchQuery) => {
  const query = normalizeText(searchQuery);

  if (!query) {
    return {
      matched: true,
      indexes: new Set(),
    };
  }

  const searchableChars = [];
  const originalIndexes = [];

  [...question].forEach((char, index) => {
    if (/[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/.test(char)) {
      searchableChars.push(char.toLowerCase());
      originalIndexes.push(index);
    }
  });

  const normalText = searchableChars.join("");

  /*
    1. 일반 단어 검색
    예: 송금, 비밀번호, 금융상품
  */
  const normalIndex = normalText.indexOf(query);

  if (normalIndex !== -1) {
    const indexes = new Set();

    for (let i = 0; i < query.length; i++) {
      indexes.add(originalIndexes[normalIndex + i]);
    }

    return {
      matched: true,
      indexes,
    };
  }

  /*
    초성으로만 입력했는지 확인
    예: ㅂㅁㅂㅎ
  */
  const isInitialSearch = /^[ㄱ-ㅎ]+$/.test(query);

  if (isInitialSearch) {
    const initials = searchableChars
      .map((char) => getInitial(char))
      .join("");

    const initialIndex = initials.indexOf(query);

    if (initialIndex !== -1) {
      const indexes = new Set();

      for (let i = 0; i < query.length; i++) {
        indexes.add(originalIndexes[initialIndex + i]);
      }

      return {
        matched: true,
        indexes,
      };
    }
  }

  return {
    matched: false,
    indexes: new Set(),
  };
};

/* 검색된 글자 표시 */
function HighlightQuestion({ text, indexes }) {
  return (
    <>
      {[...text].map((char, index) => {
        const highlighted = indexes.has(index);

        return highlighted ? (
          <span
            key={index}
            style={{
              background: "rgba(59, 130, 246, 0.28)",
              borderRadius: "4px",
              padding: "1px 2px",
            }}
          >
            {char}
          </span>
        ) : (
          <span key={index}>{char}</span>
        );
      })}
    </>
  );
}

export default function CustomerCenter() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  /*
    질문만 검색
  */
  const filteredFaqs = FAQS.map((item, originalIndex) => {
    const match = getQuestionMatch(item.q, searchQuery);

    return {
      ...item,
      originalIndex,
      matchIndexes: match.indexes,
      matched: match.matched,
    };
  }).filter((item) => item.matched);

  const toggleFaq = (originalIndex) => {
    setOpenIndex(
      openIndex === originalIndex ? null : originalIndex
    );
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px 60px 24px",
      }}
    >

     <button type="button" className="minibtn" onClick={() => navigate('/')} style={{ marginBottom: '12px' }}>
      ← 홈으로
    </button>

      <TopBar
        title="고객센터"
        crumb="홈 / 고객센터"
        search={false}
      />

      {/* 고객센터 상단 */}
      <div
        style={{
          marginTop: "24px",
          marginBottom: "28px",
        }}
      >
        <Panel
          title="무엇을 도와드릴까요?"
          sub="Wonly 고객 지원 센터입니다."
        >
          {/* 검색창 */}
          <div style={{ padding: "8px 0" }}>
            <input
              type="text"
              placeholder="질문을 검색해보세요 (예: 송금, 비밀번호, ㅂㅁㅂㅎ, ㅇㅅㄱㄹ)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "var(--bg-input, #0f172a)",
                border: "1px solid var(--border, #334155)",
                borderRadius: "12px",
                color: "var(--text, #fff)",
                fontSize: "15px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            {/* 검색 결과 개수 */}
            {searchQuery.trim() !== "" && (
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "var(--muted)",
                }}
              >
                질문 검색 결과 {filteredFaqs.length}개
              </div>
            )}
          </div>

          {/* 상담 버튼 */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                alert("1:1 문의 연결 기능은 준비 중입니다.")
              }
              className="fill"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                border: "none",
              }}
            >
              💬 1:1 채팅 문의
            </button>

            <button
              onClick={() =>
                alert(
                  "전화 상담 연결: 1588-0000 (평일 09:00 - 18:00)"
                )
              }
              className="ghost"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              📞 전화 상담 (1588-0000)
            </button>
          </div>
        </Panel>
      </div>

      {/* FAQ */}
      <Panel
        title="자주 묻는 질문 (FAQ)"
        sub="가장 많이 찾는 질문입니다"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          {filteredFaqs.length === 0 ? (
            <div
              style={{
                padding: "30px 20px",
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              해당 질문을 찾을 수 없습니다.
            </div>
          ) : (
            filteredFaqs.map((item) => (
              <div
                key={item.originalIndex}
                onClick={() =>
                  toggleFaq(item.originalIndex)
                }
                style={{
                  background:
                    "var(--card-bg, rgba(255,255,255,0.03))",
                  border:
                    "1px solid var(--border, #334155)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {/* 질문 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  <span>
                    Q.{" "}
                    <HighlightQuestion
                      text={item.q}
                      indexes={item.matchIndexes}
                    />
                  </span>

                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: "14px",
                      color: "var(--muted)",
                    }}
                  >
                    {openIndex === item.originalIndex
                      ? "▲"
                      : "▼"}
                  </span>
                </div>

                {/* 답변 */}
                {openIndex === item.originalIndex && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop:
                        "1px solid var(--border, #334155)",
                      color: "var(--muted)",
                      fontSize: "14px",
                      lineHeight: "1.7",
                    }}
                  >
                    A. {item.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}