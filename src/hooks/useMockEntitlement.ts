/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';

/**
 * Development Entitlement Switch
 * 로컬 개발 및 테스트를 위해 기본적으로 접근 권한(hasAccess)을 true로 설정합니다.
 * 환경 변수(VITE_MOCK_ENTITLEMENT_ENABLED)나 상수를 통해 제어할 수 있습니다.
 */
const DEV_MOCK_ENTITLEMENT_ACTIVE = true;
const DEFAULT_REMAINING_TICKETS = 3;

export interface UseMockEntitlementReturn {
  hasAccess: boolean;
  remainingTickets: number;
  consumeTicket: () => boolean;
}

/**
 * Mock Exam Entitlement Hook (결제/이용권 연동 준비 스텁)
 *
 * TODO: 실제 결제 검증은 서버에서 해야 함.
 * 서버 측 OAuth 세션 또는 Firebase 토큰 기반의 결제/구독 영수증 검증 API(/api/mock/verify-ticket)와
 * 연동하여 티켓 차감 및 비정상 접근을 방지해야 합니다.
 */
export function useMockEntitlement(): UseMockEntitlementReturn {
  const [hasAccess] = useState<boolean>(() => {
    // 개발 모드 상수 또는 환경 변수 확인
    return DEV_MOCK_ENTITLEMENT_ACTIVE;
  });

  const [remainingTickets, setRemainingTickets] = useState<number>(DEFAULT_REMAINING_TICKETS);

  const consumeTicket = useCallback((): boolean => {
    // TODO: 실제 결제 검증은 서버에서 해야 함 (Server-authoritative ticket consumption)
    if (!hasAccess || remainingTickets <= 0) {
      return false;
    }
    setRemainingTickets((prev) => Math.max(0, prev - 1));
    return true;
  }, [hasAccess, remainingTickets]);

  return {
    hasAccess,
    remainingTickets,
    consumeTicket,
  };
}
