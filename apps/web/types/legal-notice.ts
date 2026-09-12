export interface LegalNotice {
  id: string;
  title: string;
  content: string;
  version: string;
  targetUserRole?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalNoticeAcceptanceResponse {
  success: boolean;
  message: string;
  noticeId: string;
  acceptedAt: string;
}
