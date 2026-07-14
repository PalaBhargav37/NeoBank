export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  gender?: string;
  state?: string;
  district?: string;
  pincode?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  nomineeMobile?: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  kycStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
}
