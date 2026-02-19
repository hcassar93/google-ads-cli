import { Command } from 'commander';
import { GoogleAdsAPI } from '../api/google-ads.js';
import { isAuthenticated } from '../auth/credentials.js';
import { formatTable, formatJson, formatCurrency, displayError } from '../utils/formatting.js';
import chalk from 'chalk';
import ora from 'ora';

export function registerCampaignCommands(program: Command): void {
  program
    .command('campaigns')
    .description('List campaigns')
    .option('-p, --profile <name>', 'Profile name')
    .option('-l, --limit <number>', 'Maximum number of campaigns to return', '50')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching campaigns...').start();
      
      try {
        if (!isAuthenticated(options.profile)) {
          spinner.fail('Not authenticated');
          console.log(chalk.yellow(`Run ${chalk.cyan('google-ads-cli auth')} first.`));
          process.exit(1);
        }

        const api = new GoogleAdsAPI(options.profile);
        await api.initialize();

        const limit = parseInt(options.limit);
        const campaigns = await api.listCampaigns(limit);
        
        spinner.succeed(`Found ${campaigns.length} campaign(s)`);

        if (options.json) {
          console.log(formatJson(campaigns));
        } else if (campaigns.length > 0) {
          const formatted = campaigns.map(c => ({
            'ID': c.campaign?.id || '-',
            'Name': c.campaign?.name || '-',
            'Status': c.campaign?.status || '-',
            'Type': c.campaign?.advertising_channel_type || '-',
            'Impressions': c.metrics?.impressions || 0,
            'Clicks': c.metrics?.clicks || 0,
            'Cost': formatCurrency(c.metrics?.cost_micros || 0)
          }));
          console.log('\n' + formatTable(formatted, ['ID', 'Name', 'Status', 'Type', 'Impressions', 'Clicks', 'Cost']));
        } else {
          console.log(chalk.yellow('\nNo campaigns found.'));
        }
      } catch (error: any) {
        spinner.fail('Failed to fetch campaigns');
        displayError(error.message);
        process.exit(1);
      }
    });

  program
    .command('campaign <id>')
    .description('Get campaign details')
    .option('-p, --profile <name>', 'Profile name')
    .option('--json', 'Output as JSON')
    .action(async (id, options) => {
      const spinner = ora('Fetching campaign details...').start();
      
      try {
        if (!isAuthenticated(options.profile)) {
          spinner.fail('Not authenticated');
          console.log(chalk.yellow(`Run ${chalk.cyan('google-ads-cli auth')} first.`));
          process.exit(1);
        }

        const api = new GoogleAdsAPI(options.profile);
        await api.initialize();

        const campaign = await api.getCampaign(id);
        
        if (!campaign) {
          spinner.fail('Campaign not found');
          process.exit(1);
        }

        spinner.succeed('Campaign details retrieved');

        if (options.json) {
          console.log(formatJson(campaign));
        } else {
          console.log(chalk.bold(`\nCampaign: ${campaign.campaign?.name}\n`));
          console.log(chalk.gray('ID:'), campaign.campaign?.id);
          console.log(chalk.gray('Status:'), campaign.campaign?.status);
          console.log(chalk.gray('Type:'), campaign.campaign?.advertising_channel_type);
          console.log(chalk.gray('Bidding:'), campaign.campaign?.bidding_strategy_type);
          console.log(chalk.gray('Start Date:'), campaign.campaign?.start_date);
          if (campaign.campaign?.end_date) {
            console.log(chalk.gray('End Date:'), campaign.campaign?.end_date);
          }
          console.log(chalk.bold('\nPerformance:'));
          console.log(chalk.gray('Impressions:'), campaign.metrics?.impressions || 0);
          console.log(chalk.gray('Clicks:'), campaign.metrics?.clicks || 0);
          console.log(chalk.gray('Cost:'), formatCurrency(campaign.metrics?.cost_micros || 0));
          console.log(chalk.gray('Conversions:'), campaign.metrics?.conversions || 0);
          console.log();
        }
      } catch (error: any) {
        spinner.fail('Failed to fetch campaign');
        displayError(error.message);
        process.exit(1);
      }
    });

  program
    .command('ad-groups')
    .description('List ad groups')
    .requiredOption('-c, --campaign-id <id>', 'Campaign ID')
    .option('-p, --profile <name>', 'Profile name')
    .option('-l, --limit <number>', 'Maximum number of ad groups to return', '50')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching ad groups...').start();
      
      try {
        if (!isAuthenticated(options.profile)) {
          spinner.fail('Not authenticated');
          console.log(chalk.yellow(`Run ${chalk.cyan('google-ads-cli auth')} first.`));
          process.exit(1);
        }

        const api = new GoogleAdsAPI(options.profile);
        await api.initialize();

        const limit = parseInt(options.limit);
        const adGroups = await api.listAdGroups(options.campaignId, limit);
        
        spinner.succeed(`Found ${adGroups.length} ad group(s)`);

        if (options.json) {
          console.log(formatJson(adGroups));
        } else if (adGroups.length > 0) {
          const formatted = adGroups.map(ag => ({
            'ID': ag.ad_group?.id || '-',
            'Name': ag.ad_group?.name || '-',
            'Status': ag.ad_group?.status || '-',
            'Type': ag.ad_group?.type || '-',
            'Impressions': ag.metrics?.impressions || 0,
            'Clicks': ag.metrics?.clicks || 0,
            'Cost': formatCurrency(ag.metrics?.cost_micros || 0)
          }));
          console.log('\n' + formatTable(formatted, ['ID', 'Name', 'Status', 'Type', 'Impressions', 'Clicks', 'Cost']));
        } else {
          console.log(chalk.yellow('\nNo ad groups found.'));
        }
      } catch (error: any) {
        spinner.fail('Failed to fetch ad groups');
        displayError(error.message);
        process.exit(1);
      }
    });
}
