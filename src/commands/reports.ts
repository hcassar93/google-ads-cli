import { Command } from 'commander';
import { GoogleAdsAPI } from '../api/google-ads.js';
import { isAuthenticated } from '../auth/credentials.js';
import { formatJson, displayError } from '../utils/formatting.js';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';

export function registerReportCommands(program: Command): void {
  program
    .command('query <gaql>')
    .description('Execute a GAQL (Google Ads Query Language) query')
    .option('-p, --profile <name>', 'Profile name')
    .option('-f, --file <path>', 'Read query from file')
    .option('--json', 'Output as JSON')
    .action(async (gaql, options) => {
      const spinner = ora('Executing query...').start();
      
      try {
        if (!isAuthenticated(options.profile)) {
          spinner.fail('Not authenticated');
          console.log(chalk.yellow(`Run ${chalk.cyan('google-ads-cli auth')} first.`));
          process.exit(1);
        }

        let query = gaql;
        if (options.file) {
          spinner.text = 'Reading query from file...';
          query = await fs.readFile(options.file, 'utf-8');
        }

        const api = new GoogleAdsAPI(options.profile);
        await api.initialize();

        const results = await api.executeQuery(query);
        
        spinner.succeed(`Query returned ${results.length} result(s)`);

        if (options.json || results.length > 0) {
          console.log(formatJson(results));
        } else {
          console.log(chalk.yellow('\nNo results returned.'));
        }
      } catch (error: any) {
        spinner.fail('Query failed');
        displayError(error.message);
        process.exit(1);
      }
    });
}
