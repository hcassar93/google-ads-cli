import Conf from 'conf';
import { chmod } from 'fs/promises';
import path from 'path';
import os from 'os';

export interface ProfileConfig {
  client_id: string;
  client_secret: string;
  developer_token: string;
  customer_id: string;
  access_token?: string;
  refresh_token?: string;
  token_expiry?: number;
  login_customer_id?: string;
}

export interface AppConfig {
  profiles: Record<string, ProfileConfig>;
  active_profile: string;
}

export class ConfigManager {
  private config: Conf<AppConfig>;
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.google-ads-cli');
    this.config = new Conf<AppConfig>({
      projectName: 'google-ads-cli',
      cwd: this.configPath,
      defaults: {
        profiles: {},
        active_profile: 'default'
      }
    });

    this.secureConfigFile();
  }

  private async secureConfigFile(): Promise<void> {
    try {
      const configFile = path.join(this.configPath, 'config.json');
      await chmod(configFile, 0o600);
    } catch (error) {
      // File might not exist yet
    }
  }

  getProfile(profileName?: string): ProfileConfig | null {
    const name = profileName || this.config.get('active_profile');
    const profile = this.config.get(`profiles.${name}`) as ProfileConfig | undefined;
    return profile || null;
  }

  setProfile(profileName: string, profile: ProfileConfig): void {
    this.config.set(`profiles.${profileName}`, profile);
    this.secureConfigFile();
  }

  updateProfile(profileName: string, updates: Partial<ProfileConfig>): void {
    const existing = this.getProfile(profileName);
    if (!existing) {
      throw new Error(`Profile ${profileName} does not exist`);
    }
    this.setProfile(profileName, { ...existing, ...updates });
  }

  deleteProfile(profileName: string): void {
    const profiles = this.config.get('profiles');
    delete profiles[profileName];
    this.config.set('profiles', profiles);
  }

  getActiveProfile(): string {
    return this.config.get('active_profile');
  }

  setActiveProfile(profileName: string): void {
    if (!this.getProfile(profileName)) {
      throw new Error(`Profile ${profileName} does not exist`);
    }
    this.config.set('active_profile', profileName);
  }

  listProfiles(): string[] {
    return Object.keys(this.config.get('profiles'));
  }

  hasProfile(profileName: string): boolean {
    return this.getProfile(profileName) !== null;
  }

  clear(): void {
    this.config.clear();
  }

  getConfigPath(): string {
    return this.configPath;
  }
}

export const configManager = new ConfigManager();
