// ============================================
// VALIDATORS - Validation functions
// ============================================

// Check if value is required
export const required = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};

// Check if value is a valid email
export const email = (value) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
};

// Check if value is a valid phone number (Vietnam)
export const phone = (value) => {
  const re = /^(0|84)[0-9]{9,10}$/;
  return re.test(value);
};

// Check minimum length
export const minLength = (length) => (value) => {
  if (!value) return false;
  return value.length >= length;
};

// Check maximum length
export const maxLength = (length) => (value) => {
  if (!value) return true;
  return value.length <= length;
};

// Check exact length
export const exactLength = (length) => (value) => {
  if (!value) return false;
  return value.length === length;
};

// Check if value is a number
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Check if value is an integer
export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

// Check minimum value
export const minValue = (min) => (value) => {
  if (!value && value !== 0) return false;
  return Number(value) >= min;
};

// Check maximum value
export const maxValue = (max) => (value) => {
  if (!value && value !== 0) return false;
  return Number(value) <= max;
};

// Check if value is between min and max
export const between = (min, max) => (value) => {
  if (!value && value !== 0) return false;
  const num = Number(value);
  return num >= min && num <= max;
};

// Check if value matches regex pattern
export const pattern = (regex) => (value) => {
  if (!value) return false;
  return regex.test(value);
};

// Check if value is a valid URL
export const url = (value) => {
  const re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return re.test(value);
};

// Check if value is a valid date
export const isDate = (value) => {
  return !isNaN(Date.parse(value));
};

// Check if value is after a date
export const after = (date) => (value) => {
  if (!value) return false;
  return new Date(value) > new Date(date);
};

// Check if value is before a date
export const before = (date) => (value) => {
  if (!value) return false;
  return new Date(value) < new Date(date);
};

// Check if password is strong enough
export const strongPassword = (value) => {
  if (!value) return false;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  return value.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecial;
};

// Check if password matches confirmation
export const confirmPassword = (password) => (value) => {
  return value === password;
};

// Check if value is not empty (for arrays)
export const notEmpty = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
  return !!value;
};

// Check if value is unique in array
export const unique = (array) => (value) => {
  if (!array || !array.length) return true;
  return !array.includes(value);
};

// Check if value is in array
export const inArray = (array) => (value) => {
  return array.includes(value);
};

// Check if value is not in array
export const notInArray = (array) => (value) => {
  return !array.includes(value);
};

// Combine multiple validators
export const compose = (...validators) => (value) => {
  return validators.every(validator => validator(value));
};

// Create validator with custom message
export const withMessage = (validator, message) => (value) => {
  const result = validator(value);
  return {
    valid: result,
    message: result ? '' : message
  };
};

// Validate form data
export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const field in rules) {
    const fieldRules = rules[field];
    const value = data[field];
    
    for (const rule of fieldRules) {
      const result = typeof rule === 'function' ? rule(value) : rule;
      
      if (typeof result === 'object' && result !== null) {
        if (!result.valid) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(result.message || `${field} is invalid`);
          break;
        }
      } else if (!result) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(`${field} is invalid`);
        break;
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const rules = {
  required: (message = 'Trường này là bắt buộc') => (value) => ({
    valid: required(value),
    message
  }),
  
  email: (message = 'Email không hợp lệ') => (value) => ({
    valid: email(value),
    message
  }),
  
  phone: (message = 'Số điện thoại không hợp lệ') => (value) => ({
    valid: phone(value),
    message
  }),
  
  minLength: (length, message = `Tối thiểu ${length} ký tự`) => (value) => ({
    valid: minLength(length)(value),
    message
  }),
  
  maxLength: (length, message = `Tối đa ${length} ký tự`) => (value) => ({
    valid: maxLength(length)(value),
    message
  }),
  
  minValue: (min, message = `Giá trị tối thiểu là ${min}`) => (value) => ({
    valid: minValue(min)(value),
    message
  }),
  
  maxValue: (max, message = `Giá trị tối đa là ${max}`) => (value) => ({
    valid: maxValue(max)(value),
    message
  }),
  
  confirmPassword: (password, message = 'Mật khẩu xác nhận không khớp') => (value) => ({
    valid: confirmPassword(password)(value),
    message
  }),
  
  strongPassword: (message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt') => (value) => ({
    valid: strongPassword(value),
    message
  })
};