export const PLAN_HIERARCHY: Record<string, number> = {
  BASIC: 1,
  PRO: 2,
  PREMIUM: 3,
};

export function hasPlanAccess(
  userPlan?: string,
  requiredPlan?: string,
  userRole?: string,
): boolean {
  if (userRole?.toLowerCase() === "superadmin") {
    return true;
  }
  if (!userPlan) return false;
  const userLevel = PLAN_HIERARCHY[userPlan.toUpperCase()] ?? 0;
  const requiredLevel = PLAN_HIERARCHY[(requiredPlan || "BASIC").toUpperCase()] ?? 1;

  return userLevel >= requiredLevel;
}
