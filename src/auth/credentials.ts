import { configManager, ProfileConfig } from '../utils/config.js';
import { OAuthManager, OAuthTokens } from './oauth.js';
import chalk from 'chalk';

export async function saveCredentials(
  profileName: string,
  credentials: {
    client_id: string;
    client_secret: string;
    developer_token: string;
    customer_id: string;
    login_customer_id?: string;
  }
): Promise<void> {
  const profile: ProfileConfig = {
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    developer_token: credentials.developer_token,
    customer_id: credentials.customer_id,
    login_customer_id: credentials.login_customer_id
  };

  configManager.setProfile(profileName, profile);
}

export async function saveTokens(profileName: string, tokens: OAuthTokens): Promise<void> {
  configManager.updateProfile(profileName, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expiry: tokens.expiry_date
  });
}

export async function getValidToken(profileName?: string): Promise<string> {
  const profile = configManager.getProfile(profileName);
  
  if (!profile) {
    throw new Error('No credentials found. Run "google-ads-cli setup" first.');
  }

  if (!profile.access_token || !profile.refresh_token) {
    throw new Error('Not authenticated. Run "google-ads-cli auth" first.');
  }

  const oauthManager = new OAuthManager(profile.client_id, profile.client_secret);
  
  // Check if token is expired and refresh if needed
  if (oauthManager.isTokenExpired(profile.token_expiry)) {
    console.log(chalk.gray('Refreshing access token...'));
    
    try {
      const newTokens = await oauthManager.refreshAccessToken(profile.refresh_token);
      await saveTokens(profileName || configManager.getActiveProfile(), newTokens);
      return newTokens.access_token;
    } catch (error) {
      throw new Error('Failed to refresh token. Please run "google-ads-cli auth" again.');
    }
  }

  return profile.access_token;
}

export async function clearCredentials(profileName?: string): Promise<void> {
  const name = profileName || configManager.getActiveProfile();
  
  if (!configManager.hasProfile(name)) {
    throw new Error(`Profile "${name}" not found`);
  }

  configManager.deleteProfile(name);
  console.log(chalk.green(`✓ Credentials cleared for profile "${name}"`));
}

export function hasCredentials(profileName?: string): boolean {
  const profile = configManager.getProfile(profileName);
  return profile !== null && 
         !!profile.client_id && 
         !!profile.client_secret && 
         !!profile.developer_token && 
         !!profile.customer_id;
}

export function isAuthenticated(profileName?: string): boolean {
  const profile = configManager.getProfile(profileName);
  return hasCredentials(profileName) && 
         !!profile?.access_token && 
         !!profile?.refresh_token;
}
