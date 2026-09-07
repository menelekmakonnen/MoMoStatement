/**
 * Promo & Marketing Message Filter
 * Filters out non-transactional marketing SMS from Mobile Money providers
 */

const PROMO_KEYWORDS = [
  'win', 'congratulations', 'promo', 'bonus', 'lucky', 'click here', 'subscribe',
  'dial *170#', 'bundle offer', 'loan offer', 'free', 'jackpot', 'contest', 'vote',
  'rate', 'survey', 'download', 'install', 'app', 'upgrade', 'special offer',
  'limited time', 'expires', 'claim', 'redeem', 'eligible', 'selected', 'reward',
  'gift', 'coupon', 'discount', 'cashback offer', 'sweepstake', 'spin and win'
];

const TRANSACTION_KEYWORDS = [
  'received', 'sent', 'payment', 'transfer', 'balance', 'transaction',
  'cash in', 'cash out', 'withdrawal', 'airtime', 'reversal', 'deposit'
];

function containsKeyword(text, keyword) {
  const pattern = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?:^|\\W)${pattern}(?=$|\\W)`, 'i').test(text);
}

export function isPromoMessage(body) {
  if (!body || typeof body !== 'string') return true;
  if (body.length < 25) return true;

  const lower = body.toLowerCase();

  // Must contain GHS or GHc or amount pattern
  const hasAmount = /GHS|GH¢|[\d,]+\.\d{2}/i.test(body);
  if (!hasAmount) return true;

  // Must contain transaction keyword
  const hasTxnKeyword = TRANSACTION_KEYWORDS.some(kw => lower.includes(kw));
  if (!hasTxnKeyword) return true;

  // Check if promo keyword present AND no clear transaction structure
  const hasPromo = PROMO_KEYWORDS.some(kw => containsKeyword(lower, kw));
  const hasClearBalance = /\b(?:current\s+|new\s+|your\s+)?balance(?:\s+is)?\s*:?\s*GHS\b/i.test(body);
  if (hasPromo && !hasClearBalance) {
    return true;
  }

  // Filter http/https URLs
  if (/https?:\/\//i.test(body)) return true;

  return false;
}

export function getFilterReason(body) {
  if (!body || typeof body !== 'string') return 'Empty message';
  if (body.length < 25) return 'Message too short';
  if (!/GHS|GH¢|[\d,]+\.\d{2}/i.test(body)) return 'No amount found';
  if (/https?:\/\//i.test(body)) return 'Contains promotional URL';
  if (isPromoMessage(body)) return 'Promotional content detected';
  return null;
}
