/**
 * Validation Utilities
 * 
 * Common validation functions for user input.
 */

/** 10-digit local parts that map to backend fixed-OTP dummy numbers (+91…). */
const DUMMY_FIXED_OTP_LOCALS = new Set([
  '8595051170',
  '1234567890',
  '1111111111',
  '2222222222',
  '3333333333',
  '9876543210',
  '1212121212',
  '3434343434',
  '9999999999',
]);

// Phone number validation (Indian format)
export const phoneValidation = {
  /**
   * Validate Indian phone number
   */
  isValid(phone: string): boolean {
    // Remove spaces, dashes, and country code
    const cleaned = phone.replace(/[\s\-]/g, '').replace(/^(\+91|91)/, '');
    if (DUMMY_FIXED_OTP_LOCALS.has(cleaned)) return true;
    // Indian mobile numbers: 10 digits starting with 6-9
    return /^[6-9]\d{9}$/.test(cleaned);
  },

  /**
   * Format phone number for display
   */
  format(phone: string): string {
    const cleaned = phone.replace(/[\s\-]/g, '').replace(/^(\+91|91)/, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  },

  /**
   * Format phone number for API (with country code)
   */
  formatForApi(phone: string): string {
    const cleaned = phone.replace(/[\s\-]/g, '').replace(/^(\+91|91)/, '');
    return `+91${cleaned}`;
  },

  /**
   * Get error message for invalid phone
   */
  getErrorMessage(phone: string): string | null {
    if (!phone) return 'Phone number is required';
    if (!this.isValid(phone)) return 'Please enter a valid 10-digit mobile number';
    return null;
  },
};

// OTP validation
export const otpValidation = {
  /**
   * Validate OTP format
   */
  isValid(otp: string, length: number = 6): boolean {
    return new RegExp(`^\\d{${length}}$`).test(otp);
  },

  /**
   * Get error message for invalid OTP
   */
  getErrorMessage(otp: string, length: number = 6): string | null {
    if (!otp) return 'OTP is required';
    if (!this.isValid(otp, length)) return `Please enter a ${length}-digit OTP`;
    return null;
  },
};

// Email validation
export const emailValidation = {
  /**
   * Validate email format
   */
  isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Get error message for invalid email
   */
  getErrorMessage(email: string): string | null {
    if (!email) return null; // Email is optional in most cases
    if (!this.isValid(email)) return 'Please enter a valid email address';
    return null;
  },
};

// Name validation
export const nameValidation = {
  /**
   * Validate name (2-50 characters, letters and spaces only)
   */
  isValid(name: string): boolean {
    return /^[a-zA-Z\s]{2,50}$/.test(name.trim());
  },

  /**
   * Get error message for invalid name
   */
  getErrorMessage(name: string): string | null {
    if (!name || !name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!this.isValid(name)) return 'Name can only contain letters and spaces';
    return null;
  },
};

export default {
  phone: phoneValidation,
  otp: otpValidation,
  email: emailValidation,
  name: nameValidation,
};
