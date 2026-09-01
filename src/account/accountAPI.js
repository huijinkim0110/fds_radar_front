import config from '../config/config';

// 계좌 개설
export const createAccount = async (userId, accountData) => {
  const response = await fetch(
    `${config.API_BASE_URL}/accounts?userId=${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    }
  );

  if (!response.ok) {
    throw new Error('계좌 개설에 실패했습니다.');
  }

  return response.json();
};


// 내 계좌 목록
export const getMyAccounts = async (userId) => {
  const response = await fetch(`/api/accounts?userId=${userId}`, { method: 'GET' });
  if (!response.ok) throw new Error('계좌 목록 조회에 실패했습니다.');
  return response.json();
};


// 계좌 상세
export const getAccount = async (userId, accountId) => {
  const response = await fetch(
    `${config.API_BASE_URL}/accounts/${accountId}?userId=${userId}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    throw new Error('계좌 상세 조회에 실패했습니다.');
  }

  return response.json();
};


// 일일 이체한도 변경
export const updateAccountLimit = async (
  userId,
  accountId,
  limitData
) => {
  const response = await fetch(
    `${config.API_BASE_URL}/accounts/${accountId}/limit?userId=${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(limitData),
    }
  );

  if (!response.ok) {
    throw new Error('이체한도 변경에 실패했습니다.');
  }

  return response.json();
};


// 계좌 해지
export const closeAccount = async (userId, accountId) => {
  const response = await fetch(
    `${config.API_BASE_URL}/accounts/${accountId}?userId=${userId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('계좌 해지에 실패했습니다.');
  }

  return true;
};

