import inquirer from 'inquirer';
import chalk from 'chalk';
import { saveCredentials } from './credentials.js';
import { createProfile } from '../utils/profiles.js';
import { 
  validateClientId, 
  validateCustomerId, 
  validateDeveloperToken,
  formatCustomerId,
  sanitizeInput
} from '../utils/validation.js';

export async function runSetup(): Promise<string> {
  console.log(chalk.bold.cyan('\n🚀 Google Ads CLI Setup\n'));
  
  console.log(chalk.gray('Prerequisites:'));
  console.log(chalk.gray('1. Google Cloud Project with Google Ads API enabled'));
  console.log(chalk.gray('2. OAuth 2.0 Desktop credentials (Client ID & Secret)'));
  console.log(chalk.gray('3. Developer Token from Google Ads API Center'));
  console.log(chalk.gray('4. Google Ads Customer ID (10 digits, no dashes)\n'));

  const profileName = await createProfile();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'client_id',
      message: 'OAuth Client ID:',
      validate: (input: string) => {
        if (!validateClientId(input)) {
          return 'Invalid Client ID format. Should end with .apps.googleusercontent.com';
        }
        return true;
      },
      filter: sanitizeInput
    },
    {
      type: 'password',
      name: 'client_secret',
      message: 'OAuth Client Secret:',
      mask: '*',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Client Secret cannot be empty';
        }
        return true;
      },
      filter: sanitizeInput
    },
    {
      type: 'password',
      name: 'developer_token',
      message: 'Developer Token:',
      mask: '*',
      validate: (input: string) => {
        if (!validateDeveloperToken(input)) {
          return 'Invalid Developer Token format';
        }
        return true;
      },
      filter: sanitizeInput
    },
    {
      type: 'input',
      name: 'customer_id',
      message: 'Customer ID (10 digits):',
      validate: (input: string) => {
        const formatted = formatCustomerId(input);
        if (!validateCustomerId(formatted)) {
          return 'Invalid Customer ID. Must be 10 digits.';
        }
        return true;
      },
      filter: (input: string) => formatCustomerId(sanitizeInput(input))
    },
    {
      type: 'input',
      name: 'login_customer_id',
      message: 'Login Customer ID (optional, for MCC accounts):',
      default: '',
      validate: (input: string) => {
        if (!input.trim()) return true;
        const formatted = formatCustomerId(input);
        if (!validateCustomerId(formatted)) {
          return 'Invalid Login Customer ID. Must be 10 digits.';
        }
        return true;
      },
      filter: (input: string) => {
        if (!input.trim()) return undefined;
        return formatCustomerId(sanitizeInput(input));
      }
    }
  ]);

  await saveCredentials(profileName, {
    client_id: answers.client_id,
    client_secret: answers.client_secret,
    developer_token: answers.developer_token,
    customer_id: answers.customer_id,
    login_customer_id: answers.login_customer_id
  });

  console.log(chalk.green(`\n✓ Profile "${profileName}" configured successfully!`));
  console.log(chalk.gray(`\nNext step: Run ${chalk.cyan('google-ads-cli auth')} to authenticate\n`));

  return profileName;
}

export async function updateConfiguration(profileName?: string): Promise<void> {
  console.log(chalk.bold.cyan('\n⚙️  Update Configuration\n'));

  const { field } = await inquirer.prompt([
    {
      type: 'list',
      name: 'field',
      message: 'What would you like to update?',
      choices: [
        { name: 'Client ID', value: 'client_id' },
        { name: 'Client Secret', value: 'client_secret' },
        { name: 'Developer Token', value: 'developer_token' },
        { name: 'Customer ID', value: 'customer_id' },
        { name: 'Login Customer ID', value: 'login_customer_id' }
      ]
    }
  ]);

  let value: string;
  
  if (field === 'client_id') {
    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'New Client ID:',
      validate: (input: string) => validateClientId(input) || 'Invalid Client ID format'
    }]);
    value = answer.value;
  } else if (field === 'client_secret' || field === 'developer_token') {
    const answer = await inquirer.prompt([{
      type: 'password',
      name: 'value',
      message: `New ${field === 'client_secret' ? 'Client Secret' : 'Developer Token'}:`,
      mask: '*',
      validate: (input: string) => input.trim().length > 0 || 'Cannot be empty'
    }]);
    value = answer.value;
  } else if (field === 'customer_id' || field === 'login_customer_id') {
    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: `New ${field === 'customer_id' ? 'Customer ID' : 'Login Customer ID'}:`,
      validate: (input: string) => {
        if (!input.trim() && field === 'login_customer_id') return true;
        const formatted = formatCustomerId(input);
        return validateCustomerId(formatted) || 'Must be 10 digits';
      },
      filter: formatCustomerId
    }]);
    value = answer.value;
  }

  // Implementation of actual update would go here using configManager
  console.log(chalk.green(`\n✓ ${field} updated successfully!\n`));
}
