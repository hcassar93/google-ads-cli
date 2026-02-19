import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerAccountCommands } from './commands/accounts.js';
import { registerCampaignCommands } from './commands/campaigns.js';
import { registerKeywordCommands } from './commands/keywords.js';
import { registerReportCommands } from './commands/reports.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('google-ads-cli')
  .description('CLI for Google Ads API - Access campaigns, keywords, and Keyword Planner')
  .version('1.0.0');

registerAuthCommands(program);
registerAccountCommands(program);
registerCampaignCommands(program);
registerKeywordCommands(program);
registerReportCommands(program);

program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.gray(`Run ${chalk.cyan('google-ads-cli --help')} for available commands`));
  process.exit(1);
});

export { program };
