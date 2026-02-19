import inquirer from 'inquirer';
import { configManager } from './config.js';
import chalk from 'chalk';

export async function selectProfile(profileName?: string): Promise<string> {
  if (profileName) {
    if (!configManager.hasProfile(profileName)) {
      throw new Error(`Profile "${profileName}" not found`);
    }
    return profileName;
  }

  const profiles = configManager.listProfiles();
  
  if (profiles.length === 0) {
    throw new Error('No profiles found. Run "google-ads-cli setup" first.');
  }

  if (profiles.length === 1) {
    return profiles[0];
  }

  const activeProfile = configManager.getActiveProfile();
  
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Select a profile:',
      choices: profiles.map(p => ({
        name: p === activeProfile ? `${p} ${chalk.green('(active)')}` : p,
        value: p
      })),
      default: activeProfile
    }
  ]);

  return selected;
}

export async function createProfile(): Promise<string> {
  const profiles = configManager.listProfiles();
  
  const { profileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'profileName',
      message: 'Profile name:',
      default: profiles.length === 0 ? 'default' : undefined,
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Profile name cannot be empty';
        }
        if (configManager.hasProfile(input)) {
          return `Profile "${input}" already exists`;
        }
        return true;
      }
    }
  ]);

  return profileName;
}

export function listAllProfiles(): void {
  const profiles = configManager.listProfiles();
  const activeProfile = configManager.getActiveProfile();

  if (profiles.length === 0) {
    console.log(chalk.yellow('No profiles found.'));
    console.log(`Run ${chalk.cyan('google-ads-cli setup')} to create a profile.`);
    return;
  }

  console.log(chalk.bold('\nAvailable profiles:'));
  profiles.forEach(profile => {
    const isActive = profile === activeProfile;
    const indicator = isActive ? chalk.green('● ') : '  ';
    const suffix = isActive ? chalk.gray(' (active)') : '';
    console.log(`${indicator}${profile}${suffix}`);
  });
  console.log();
}

export async function switchProfile(): Promise<void> {
  const profiles = configManager.listProfiles();
  
  if (profiles.length === 0) {
    console.log(chalk.yellow('No profiles found.'));
    return;
  }

  const currentProfile = configManager.getActiveProfile();
  
  const { newProfile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'newProfile',
      message: 'Switch to profile:',
      choices: profiles,
      default: currentProfile
    }
  ]);

  if (newProfile === currentProfile) {
    console.log(chalk.yellow(`Already using profile "${newProfile}"`));
    return;
  }

  configManager.setActiveProfile(newProfile);
  console.log(chalk.green(`✓ Switched to profile "${newProfile}"`));
}
