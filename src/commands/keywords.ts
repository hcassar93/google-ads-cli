import { Command } from 'commander';
import { GoogleAdsAPI } from '../api/google-ads.js';
import { isAuthenticated } from '../auth/credentials.js';
import { formatTable, formatJson, displayError } from '../utils/formatting.js';
import chalk from 'chalk';
import ora from 'ora';

export function registerKeywordCommands(program: Command): void {
  program
    .command('keyword-ideas [keywords...]')
    .description('Generate keyword ideas')
    .option('-p, --profile <name>', 'Profile name')
    .option('-u, --url <url>', 'URL to get keyword ideas from')
    .option('-l, --language <code>', 'Language code (e.g., 1000 for English)', '1000')
    .option('--location <codes...>', 'Location codes (e.g., 2840 for USA)')
    .option('--limit <number>', 'Maximum number of ideas to return', '50')
    .option('--json', 'Output as JSON')
    .action(async (keywords, options) => {
      const spinner = ora('Generating keyword ideas...').start();
      
      try {
        if (!isAuthenticated(options.profile)) {
          spinner.fail('Not authenticated');
          console.log(chalk.yellow(`Run ${chalk.cyan('google-ads-cli auth')} first.`));
          process.exit(1);
        }

        if (!keywords.length && !options.url) {
          spinner.fail('Error');
          console.log(chalk.red('Please provide keywords or a URL'));
          process.exit(1);
        }

        const api = new GoogleAdsAPI(options.profile);
        await api.initialize();

        const params: any = {
          pageSize: parseInt(options.limit),
          language: `geoTargetConstants/${options.language}`
        };

        if (keywords.length > 0) {
          params.keywords = keywords;
        }

        if (options.url) {
          params.url = options.url;
        }

        if (options.location) {
          params.locations = options.location.map((loc: string) => `geoTargetConstants/${loc}`);
        }

        const results = await api.generateKeywordIdeas(params);
        
        spinner.succeed(`Generated ${results.length || 0} keyword idea(s)`);

        if (options.json) {
          console.log(formatJson(results));
        } else if (results && results.length > 0) {
          const formatted = results.map((idea: any) => ({
            'Keyword': idea.text || '-',
            'Avg Monthly Searches': idea.keyword_idea_metrics?.avg_monthly_searches || 0,
            'Competition': idea.keyword_idea_metrics?.competition || '-',
            'Low Bid': idea.keyword_idea_metrics?.low_top_of_page_bid_micros ? 
              `$${(idea.keyword_idea_metrics.low_top_of_page_bid_micros / 1000000).toFixed(2)}` : '-',
            'High Bid': idea.keyword_idea_metrics?.high_top_of_page_bid_micros ? 
              `$${(idea.keyword_idea_metrics.high_top_of_page_bid_micros / 1000000).toFixed(2)}` : '-'
          }));
          console.log('\n' + formatTable(formatted, ['Keyword', 'Avg Monthly Searches', 'Competition', 'Low Bid', 'High Bid']));
        } else {
          console.log(chalk.yellow('\nNo keyword ideas found.'));
        }
      } catch (error: any) {
        spinner.fail('Failed to generate keyword ideas');
        displayError(error.message);
        process.exit(1);
      }
    });

  program
    .command('locations <search>')
    .description('Search for geo target locations')
    .option('-p, --profile <name>', 'Profile name')
    .option('-l, --limit <number>', 'Maximum number of results', '20')
    .option('--json', 'Output as JSON')
    .action(async (search, options) => {
      const spinner = ora('Searching locations...').start();
      
      try {
        if (!isAuthenticated(options.profile)) {
          spinner.fail('Not authenticated');
          console.log(chalk.yellow(`Run ${chalk.cyan('google-ads-cli auth')} first.`));
          process.exit(1);
        }

        const api = new GoogleAdsAPI(options.profile);
        await api.initialize();

        const limit = parseInt(options.limit);
        const results = await api.searchGeoTargets(search, limit);
        
        spinner.succeed(`Found ${results.length} location(s)`);

        if (options.json) {
          console.log(formatJson(results));
        } else if (results.length > 0) {
          const formatted = results.map(loc => ({
            'ID': loc.geo_target_constant?.id || '-',
            'Name': loc.geo_target_constant?.name || '-',
            'Country': loc.geo_target_constant?.country_code || '-',
            'Type': loc.geo_target_constant?.target_type || '-'
          }));
          console.log('\n' + formatTable(formatted, ['ID', 'Name', 'Country', 'Type']));
        } else {
          console.log(chalk.yellow('\nNo locations found.'));
        }
      } catch (error: any) {
        spinner.fail('Failed to search locations');
        displayError(error.message);
        process.exit(1);
      }
    });
}
