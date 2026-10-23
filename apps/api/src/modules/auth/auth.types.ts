export type AuthUser = {
  uid: string;
  email: string;
  role: string;
  tenantId?: string;
  plan?: string;
  name?: string;
  businessName?: string;
  employeeId?: string;
};
