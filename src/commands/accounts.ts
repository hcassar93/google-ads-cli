import { Command } from 'commander';
import { GoogleAdsAPI } from '../api/google-ads.js';
import { isAuthenticated } from '../auth/credentials.js';
import { formatTable, formatJson, displayError } from '../utils/formatting.js';
import chalk from 'chalk';
import ora from 'ora';

export function registerAccountCommands(program: Command): void {
  program
    .command('accounts')
    .description('List accessible Google Ads accounts')
    .option('-p, --profile <name>', 'Profile name')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching accounts...').start();
      
      try {
        if (!isAuthenticated(options.profile)) {
          spinner.fail('Not authenticated');
          console.log(chalk.yellow(`Run ${chalk.cyan('google-ads-cli auth')} first.`));
          process.exit(1);
        }

        const api = new GoogleAdsAPI(options.profile);
        await api.initialize();

        const accounts = await api.listAccessibleCustomers();
        spinner.succeed(`Found ${accounts.length} account(s)`);

        if (options.json) {
          console.log(formatJson(accounts));
        } else if (accounts.length > 0) {
          const formatted = accounts.map(acc => ({
            'Customer ID': acc.customer_client?.id || '-',
            'Name': acc.customer_client?.descriptive_name || '-',
            'Currency': acc.customer_client?.currency_code || '-',
            'Time Zone': acc.customer_client?.time_zone || '-'
          }));
          console.log('\n' + formatTable(formatted, ['Customer ID', 'Name', 'Currency', 'Time Zone']));
        } else {
          console.log(chalk.yellow('\nNo accounts found.'));
        }
      } catch (error: any) {
        spinner.fail('Failed to fetch accounts');
        displayError(error.message);
        process.exit(1);
      }
    });
}
