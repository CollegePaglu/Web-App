/**
 * User Types
 */

export interface User {
  _id: string;
  phone: string;
  name?: string; // keeping for backward compatibility
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'admin' | 'alpha';
  isProfileComplete: boolean;
  isVerified: boolean;
  college?: {
    id?: string;
    name?: string;
    department?: string;
    year?: number;
    rollNumber?: string;
  };
  collegeId?: string; // deprecated
  collegeName?: string; // deprecated
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  email?: string;
  college?: {
    name?: string;
    department?: string;
    year?: number;
    rollNumber?: string;
  };
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  clearUser: () => void;
}

export interface CompleteProfilePayload {
  firstName: string;
  lastName: string;
  college?: {
    name: string;
    department: string;
    year: number;
  };
  email?: string;
}

export interface ProfileStatus {
  isComplete: boolean;
  missingFields: string[];
}

