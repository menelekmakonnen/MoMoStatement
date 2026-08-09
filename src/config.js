/**
 * MoMo Statement — Single CONFIG Object
 * [LAW] Separate configuration from business logic (§13.1)
 * All sheet names, status enums, role names, ID prefixes, and tunables live here.
 * Rename a sheet = change one line.
 */

const CONFIG = {
  /* ─── Product Identity ─── */
  APP_NAME: 'MoMo Statement',
  APP_VERSION: '2.0.0',
  BRAND: 'ICUNI Connect',
  DOMAIN: 'momo.icuni.org',
  
  /* ─── GAS Backend ─── */
  // Updated after clasp deploy
  GAS_DEPLOY_URL: '',
  GAS_DEPLOY_ID: '',
  
  /* ─── Spreadsheet IDs ─── */
  // Updated after sheet creation
  SPREADSHEET_ID: '',
  
  /* ─── Sheet Names ─── */
  SHEETS: {
    USERS: 'Users',
    SESSIONS: 'Sessions',
    ACTIVITY_LOG: 'Activity_Log',
    FEEDBACK: 'Feedback',
    SITE_USAGE: 'Site_Usage',
    COUNTERS: 'Counters',
    CONFIG: 'CONFIG',
    META: '_Meta',
    LOGS: '_Logs',
  },
  
  /* ─── Role Hierarchy ─── */
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    GOD_MODE: 'god_mode',
  },
  ROLE_TIER: {
    user: 0,
    admin: 1,
    super_admin: 2,
    god_mode: 3,
  },
  
  /* ─── ID Prefixes ─── */
  ID_PREFIX: {
    USER: 'USR',
    SESSION: 'SES',
    FEEDBACK: 'FBK',
  },
  
  /* ─── Auth Tunables ─── */
  AUTH: {
    OTP_TTL_MS: 5 * 60 * 1000,          // 5 minutes
    OTP_MAX_ATTEMPTS: 3,
    OTP_RATE_LIMIT: 5,                    // max 5 sends per hour
    PIN_MAX_ATTEMPTS: 5,
    PIN_LOCKOUT_MS: 15 * 60 * 1000,       // 15 minutes
    SESSION_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
    PASSWORD_SALT_PREFIX: 'MOMOSTATEMENT_V2_',
    ANTI_ENUM_DELAY_MS: 1200,
  },
  
  /* ─── Data Tunables ─── */
  DATA: {
    SHARD_LIMIT: 4000,
    LOG_ROTATION_LIMIT: 500,
    CACHE_TTL_MS: 5 * 60 * 1000,         // 5 minutes (client SWR)
    GAS_CACHE_TTL_S: 21600,              // 6 hours (CacheService)
  },
  
  /* ─── Quota Limits (GAS Daily) ─── */
  QUOTA: {
    EMAIL_DAILY: 100,
    EMAIL_ALERT_AT: 80,
    FETCH_DAILY: 20000,
    FETCH_ALERT_AT: 15000,
    EXEC_DAILY_MIN: 90,
  },
  
  /* ─── Providers ─── */
  PROVIDERS: {
    MTN: {
      id: 'MTN',
      name: 'MTN MoMo',
      color: '#FFC000',
      senderIds: ['MobileMoney', 'MTN', 'MTN MoMo', 'mtn', 'mobilemoney'],
    },
    TELECEL: {
      id: 'TELECEL',
      name: 'Telecel Cash',
      color: '#E60000',
      senderIds: ['Telecel', 'VodaCash', 'Vodafone', 'telecel', 'vodacash', 'vodafone'],
    },
    AIRTELTIGO: {
      id: 'AIRTELTIGO',
      name: 'AirtelTigo Money',
      color: '#00A0E1',
      senderIds: ['AirtelTigo', 'AT', 'Tigo', 'airteltigo', 'at'],
    },
  },
  
  /* ─── Transaction Types ─── */
  TXN_TYPES: {
    RECEIVED: 'RECEIVED',
    SENT: 'SENT',
    MERCHANT: 'MERCHANT',
    AIRTIME: 'AIRTIME',
    CASH_IN: 'CASH_IN',
    CASH_OUT: 'CASH_OUT',
    FEE: 'FEE',
    REVERSAL: 'REVERSAL',
    BALANCE: 'BALANCE',
  },
  
  /* ─── Categories ─── */
  CATEGORIES: {
    INCOME: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'transfer',
    UTILITY: 'utility',
  },
  
  /* ─── Theme ─── */
  THEME: {
    BRAND_HEX: '#D4A847',                // Warm gold
    DARK_BASE: '#141414',                  // Charcoal black
    DARK_SURFACE: '#1E1E1E',
    DARK_ELEVATED: '#262626',
    SPRING_EASE: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  /* ─── Emails ─── */
  EMAILS: {
    SUPPORT: 'support@icuni.org',
    FEEDBACK: 'feedback@icuni.org',
    TECH_ISSUE: 'tech.issue@icuni.org',
    NOREPLY: 'noreply@icuni.org',
    HELLO: 'hello@icuni.org',
  },
  
  /* ─── Feature Flags ─── */
  FEATURES: {
    CLOUD_SYNC: false,                     // Coming soon
    PAYMENT: false,                        // Coming soon
    MULTI_PROVIDER_CONSOLIDATION: false,   // Coming soon
    PROOF_OF_INCOME: true,
    ANOMALY_DETECTION: true,
    BUSINESS_VS_PERSONAL: true,
  },
  
  /* ─── API Client ─── */
  API: {
    MAX_RETRIES: 3,
    BACKOFF_BASE_MS: 1000,
    TIMEOUT_MS: 15000,
    CONTENT_TYPE: 'text/plain;charset=utf-8',
  },
};

export default CONFIG;
