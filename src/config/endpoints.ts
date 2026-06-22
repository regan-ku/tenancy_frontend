import env from "./env";

const BASE = env.API_URL;

export const endpoints = {
  // ==========================================
  // ACCOUNTS & AUTH
  // ==========================================
  AUTH: {
    LOGIN: `${BASE}/accounts/auth/login/`,
    REGISTER: `${BASE}/accounts/auth/register/`,
    REFRESH: `${BASE}/accounts/refresh/`,
    VERIFY_TOKEN: `${BASE}/accounts/verify/`,
    USER_STATE: `${BASE}/accounts/user-state/`, // Post-login routing engine

    // ✅ ADDED: Password Recovery Endpoints
    FORGOT_PASSWORD: `${BASE}/accounts/auth/password-reset/`, // Request reset link via email
    RESET_PASSWORD: `${BASE}/accounts/auth/password-reset/confirm/`, // Submit new password with token
  },

  PROFILE: {
    ME: `${BASE}/accounts/profile/me/`,
    UPDATE: `${BASE}/accounts/profile/update/`,
    UPGRADE: `${BASE}/accounts/profile/upgrade/`,
    NEXT_OF_KIN: `${BASE}/accounts/next-of-kin/`,
    NEXT_OF_KIN_DETAIL: (id: number) => `${BASE}/accounts/next-of-kin/${id}/`,
    VERIFICATION_STATUS: `${BASE}/accounts/verification/status/`,
    VERIFICATION_SUBMIT: `${BASE}/accounts/verification/submit/`,
    ONBOARDING_SUBMIT: `${BASE}/accounts/profile/complete/`,
  },

  // ==========================================
  // PROPERTIES & UNITS
  // ==========================================
  PROPERTIES: {
    LIST: `${BASE}/properties/properties/`,
    DETAIL: (id: number) => `${BASE}/properties/properties/${id}/`,

    // ✅ ADDED: Architectural Bridge Endpoint for Step 4
    FINALIZE_UNIT_GROUPS: (propertyId: number) =>
      `${BASE}/properties/properties/${propertyId}/finalize-unit-groups/`,

    // Unit Groups
    UNIT_GROUPS: (propertyId: number) =>
      `${BASE}/properties/properties/${propertyId}/unit-groups/`,
    UNIT_GROUP_DETAIL: (propertyId: number, groupId: number) =>
      `${BASE}/properties/properties/${propertyId}/unit-groups/${groupId}/`,
    GENERATE_UNITS: (propertyId: number, groupId: number) =>
      `${BASE}/properties/properties/${propertyId}/unit-groups/${groupId}/generate/`,

    // Units
    UNITS: (propertyId: number) =>
      `${BASE}/properties/properties/${propertyId}/units/`,
    UNIT_DETAIL: (propertyId: number, unitId: number) =>
      `${BASE}/properties/properties/${propertyId}/units/${unitId}/`,
    UPDATE_UNIT_STATUS: (propertyId: number, unitId: number) =>
      `${BASE}/properties/properties/${propertyId}/units/${unitId}/update-status/`,

    // Media
    MEDIA: (propertyId: number) =>
      `${BASE}/properties/properties/${propertyId}/media/`,
    MEDIA_DETAIL: (propertyId: number, mediaId: number) =>
      `${BASE}/properties/properties/${propertyId}/media/${mediaId}/`,
  },

  // ==========================================
  // MARKETPLACE (Public)
  // ==========================================
  MARKETPLACE: {
    LISTINGS: `${BASE}/marketplace/listings/`,
    LISTING_DETAIL: (id: number) => `${BASE}/marketplace/listings/${id}/`,
    SEARCH: `${BASE}/marketplace/search/`,
    NEARBY: `${BASE}/marketplace/nearby/`,
    SAVED: `${BASE}/marketplace/saved/`,
    SAVED_DETAIL: (id: number) => `${BASE}/marketplace/saved/${id}/`,
    PUBLISH: (id: number) => `${BASE}/marketplace/properties/${id}/publish/`,
    HIDE: (id: number) => `${BASE}/marketplace/properties/${id}/hide/`,
    UNPUBLISH: (id: number) =>
      `${BASE}/marketplace/properties/${id}/unpublish/`,
    FEATURED: `${BASE}/marketplace/featured/`, //
    RESTORE: (id: number) => `${BASE}/marketplace/properties/${id}/restore/`,
  },

  // ==========================================
  // TENANCIES
  // ==========================================
  TENANCIES: {
    LIST: `${BASE}/tenancies/tenancies/`,
    DETAIL: (id: number) => `${BASE}/tenancies/tenancies/${id}/`,
    ACTIVATE: (id: number) => `${BASE}/tenancies/tenancies/${id}/activate/`,
    EXTEND: (id: number) => `${BASE}/tenancies/tenancies/${id}/extend/`,
    TERMINATE: (id: number) => `${BASE}/tenancies/tenancies/${id}/terminate/`,
    TRANSFER: (id: number) => `${BASE}/tenancies/tenancies/${id}/transfer/`,
    ADD_NOTE: (id: number) => `${BASE}/tenancies/tenancies/${id}/add_note/`,
    NOTES: `${BASE}/tenancies/notes/`,
    OCCUPANCY: `${BASE}/tenancies/occupancy/`,
    TENANT_HISTORY: (tenantId: number) =>
      `${BASE}/tenancies/tenants/${tenantId}/history/`,
  },

  // ==========================================
  // APPLICATIONS
  // ==========================================
  APPLICATIONS: {
    LIST: `${BASE}/applications/applications/`,
    DETAIL: (id: number) => `${BASE}/applications/applications/${id}/`,
    MAKE_DECISION: (id: number) =>
      `${BASE}/applications/applications/${id}/make_decision/`,
    ADD_NOTE: (id: number) =>
      `${BASE}/applications/applications/${id}/add_note/`,
    RENTAL: `${BASE}/applications/rental/`,
    TRANSFER: `${BASE}/applications/transfer/`,
  },

  // ==========================================
  // AGENCIES
  // ==========================================
  AGENCIES: {
    LIST: `${BASE}/agencies/agencies/`,
    DETAIL: (id: number) => `${BASE}/agencies/agencies/${id}/`,
    DIRECTORS: (agencyId: number) =>
      `${BASE}/agencies/agencies/${agencyId}/directors/`,
    STAFF: (agencyId: number) => `${BASE}/agencies/agencies/${agencyId}/staff/`,
    DELEGATIONS: (agencyId: number) =>
      `${BASE}/agencies/agencies/${agencyId}/delegations/`,
    PROFILE: (agencyId: number) =>
      `${BASE}/agencies/agencies/${agencyId}/profile/`,
    VERIFICATION: (agencyId: number) =>
      `${BASE}/agencies/agencies/${agencyId}/verification/`,
  },

  // ==========================================
  // PAYMENTS
  // ==========================================
  PAYMENTS: {
    INVOICES: `${BASE}/payments/invoices/`,
    INVOICE_DETAIL: (id: string) => `${BASE}/payments/invoices/${id}/`,
    PAYMENTS_LIST: `${BASE}/payments/payments/`,
    RECEIPTS: `${BASE}/payments/receipts/`,
    RECEIPT_DOWNLOAD: (id: string) =>
      `${BASE}/payments/receipts/${id}/download/`,
    ACCOUNTS: `${BASE}/payments/accounts/`,
    ACCOUNT_DETAIL: (id: number) => `${BASE}/payments/accounts/${id}/`,
    ACCOUNT_VERIFY: (id: number) => `${BASE}/payments/accounts/${id}/verify/`,
    STK_PUSH: `${BASE}/payments/actions/stk-push/`,
    WAIVER: `${BASE}/payments/actions/waiver/`,
    REFUND: `${BASE}/payments/actions/refund/`,
    ARREARS: `${BASE}/payments/arrears/`,
  },

  // ==========================================
  // MAINTENANCE
  // ==========================================
  MAINTENANCE: {
    REQUESTS: `${BASE}/maintenance/requests/`,
    REQUEST_DETAIL: (id: string) => `${BASE}/maintenance/requests/${id}/`,
    ASSIGN: (id: string) => `${BASE}/maintenance/requests/${id}/assign/`,
    UPDATE_STATUS: (id: string) =>
      `${BASE}/maintenance/requests/${id}/update_status/`,
    RESOLVE: (id: string) => `${BASE}/maintenance/requests/${id}/resolve/`,
    CATEGORIES: `${BASE}/maintenance/categories/`,
  },

  // ==========================================
  // DOCUMENTS
  // ==========================================
  DOCUMENTS: {
    LIST: `${BASE}/documents/`,
    DETAIL: (id: number) => `${BASE}/documents/${id}/`,
    GENERATE: `${BASE}/documents/generate/`,
    UPLOAD: `${BASE}/documents/upload/`,
    DOWNLOAD: (id: number) => `${BASE}/documents/${id}/download/`,
  },

  // ==========================================
  // INTEGRATIONS
  // ==========================================
  INTEGRATIONS: {
    MPESA_STK_PUSH: `${BASE}/integrations/mpesa/stk-push/`,
    SMS_SEND: `${BASE}/integrations/sms/send/`,
    WHATSAPP_SEND: `${BASE}/integrations/whatsapp/send/`,
  },

  // ==========================================
  // REPORTS & DASHBOARDS
  // ==========================================
  REPORTS: {
    DASHBOARD_ME: `${BASE}/reports/dashboards/me/`,
    REPORTS_LIST: `${BASE}/reports/reports/`,
    GENERATE_REPORT: `${BASE}/reports/reports/`,
    DOWNLOAD_REPORT: (id: number) => `${BASE}/reports/reports/${id}/download/`,
    SCHEDULES: `${BASE}/reports/schedules/`,
  },

  // ==========================================
  // COMMUNICATIONS
  // ==========================================
  COMMUNICATIONS: {
    NOTIFICATIONS: `${BASE}/communications/notifications/`,
    MARK_READ: (id: string) =>
      `${BASE}/communications/notifications/${id}/mark-read/`,
    MARK_ALL_READ: `${BASE}/communications/notifications/mark-all-read/`,
    MESSAGES: `${BASE}/communications/messages/`,
    TEMPLATES: `${BASE}/communications/templates/`,
  },
};

export default endpoints;
