import { existsSync } from 'fs';

export function validateCustomerId(customerId: string): boolean {
  // Customer ID should be 10 digits, no dashes
  return /^\d{10}$/.test(customerId);
}

export function formatCustomerId(customerId: string): string {
  // Remove any dashes or spaces
  return customerId.replace(/[-\s]/g, '');
}

export function validateClientId(clientId: string): boolean {
  // Google OAuth client IDs end with .apps.googleusercontent.com
  return clientId.includes('.apps.googleusercontent.com');
}

export function validateDeveloperToken(token: string): boolean {
  // Developer tokens are typically alphanumeric strings
  return token.length > 0 && /^[a-zA-Z0-9_-]+$/.test(token);
}

export function validateFilePath(filePath: string): boolean {
  return existsSync(filePath);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePort(port: number): boolean {
  return port > 0 && port < 65536;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeInput(input: string): string {
  return input.trim();
}
