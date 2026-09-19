/**
 * Loyalty program rules — the single source of truth for earn/redeem math.
 *
 * There is no admin settings store in this project, so the values are
 * centralized here and overridable via environment variables (no scattered
 * magic numbers). Defaults implement the recommended rule:
 *   • 1 MAD spent  = 1 point earned
 *   • 100 points   = 10 MAD discount   (⇒ 1 point = 0.10 MAD)
 *   • redemption happens in blocks of 100 points, minimum 100.
 */

const num = (key: string, fallback: number): number => {
  const raw = process.env[key];
  const n = raw != null ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const loyaltyConfig = {
  /** Points earned per 1 MAD of eligible spend. */
  pointsPerMad: num('LOYALTY_POINTS_PER_MAD', 1),
  /** Redemption block size in points. */
  redeemStep: num('LOYALTY_REDEEM_STEP', 100),
  /** MAD discount granted per redemption block. */
  redeemStepValue: num('LOYALTY_REDEEM_STEP_VALUE', 10),
  /** Minimum points a customer must redeem at once. */
  minRedeem: num('LOYALTY_MIN_REDEEM', 100),
};

/** MAD value of a single point (e.g. 0.10). */
export const pointValue = () =>
  loyaltyConfig.redeemStepValue / loyaltyConfig.redeemStep;

/** Points earned for an eligible spend amount (floored — no fractional points). */
export const pointsForAmount = (amount: number): number =>
  Math.max(0, Math.floor(amount * loyaltyConfig.pointsPerMad));

/** MAD value of a given number of points. */
export const valueForPoints = (points: number): number =>
  Math.round(points * pointValue() * 100) / 100;

/** Snap a requested point amount down to a valid, redeemable multiple of the step. */
export const snapToStep = (points: number): number => {
  const p = Math.floor(Number(points) || 0);
  if (p < loyaltyConfig.minRedeem) return 0;
  return Math.floor(p / loyaltyConfig.redeemStep) * loyaltyConfig.redeemStep;
};
