import { Command } from 'commander';
import { runSetup } from '../auth/setup.js';
import { OAuthManager } from '../auth/oauth.js';
import { saveTokens, clearCredentials, hasCredentials, isAuthenticated } from '../auth/credentials.js';
import { configManager } from '../utils/config.js';
import { selectProfile, listAllProfiles, switchProfile } from '../utils/profiles.js';
import chalk from 'chalk';

export function registerAuthCommands(program: Command): void {
  program
    .command('setup')
    .description('Configure Google Ads API credentials')
    .action(async () => {
      try {
        await runSetup();
      } catch (error: any) {
        console.error(chalk.red('Setup failed:'), error.message);
        process.exit(1);
      }
    });

  program
    .command('auth')
    .description('Authenticate with Google Ads API')
    .option('-p, --profile <name>', 'Profile name')
    .action(async (options) => {
      try {
        const profileName = await selectProfile(options.profile);
        
        if (!hasCredentials(profileName)) {
          console.log(chalk.yellow('No credentials found.'));
          console.log(`Run ${chalk.cyan('google-ads-cli setup')} first.`);
          process.exit(1);
        }

        const profile = configManager.getProfile(profileName);
        if (!profile) {
          throw new Error('Profile not found');
        }

        const oauthManager = new OAuthManager(profile.client_id, profile.client_secret);
        const tokens = await oauthManager.authorize();
        await saveTokens(profileName, tokens);

        console.log(chalk.green(`\n✓ Successfully authenticated profile "${profileName}"`));
      } catch (error: any) {
        console.error(chalk.red('Authentication failed:'), error.message);
        process.exit(1);
      }
    });

  program
    .command('logout')
    .description('Clear authentication credentials')
    .option('-p, --profile <name>', 'Profile name')
    .action(async (options) => {
      try {
        const profileName = options.profile || configManager.getActiveProfile();
        await clearCredentials(profileName);
      } catch (error: any) {
        console.error(chalk.red('Logout failed:'), error.message);
        process.exit(1);
      }
    });

  program
    .command('profiles')
    .description('Manage profiles')
    .option('-l, --list', 'List all profiles')
    .option('-s, --switch', 'Switch active profile')
    .action(async (options) => {
      try {
        if (options.switch) {
          await switchProfile();
        } else {
          listAllProfiles();
        }
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program
    .command('config')
    .description('Show current configuration')
    .option('-p, --profile <name>', 'Profile name')
    .action((options) => {
      try {
        const profileName = options.profile || configManager.getActiveProfile();
        const profile = configManager.getProfile(profileName);

        if (!profile) {
          console.log(chalk.yellow(`Profile "${profileName}" not found.`));
          process.exit(1);
        }

        console.log(chalk.bold(`\nConfiguration for profile "${profileName}":\n`));
        console.log(chalk.gray('Client ID:'), profile.client_id);
        console.log(chalk.gray('Customer ID:'), profile.customer_id);
        if (profile.login_customer_id) {
          console.log(chalk.gray('Login Customer ID:'), profile.login_customer_id);
        }
        console.log(chalk.gray('Authenticated:'), isAuthenticated(profileName) ? chalk.green('Yes') : chalk.yellow('No'));
        console.log();
      } catch (error: any) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}
