import { GoogleAdsApi, Customer } from 'google-ads-api';
import { configManager } from '../utils/config.js';
import { getValidToken } from '../auth/credentials.js';

export class GoogleAdsAPI {
  private client: GoogleAdsApi;
  private customer: Customer | null = null;
  private profileName?: string;

  constructor(profileName?: string) {
    this.profileName = profileName;
    const profile = configManager.getProfile(profileName);
    
    if (!profile) {
      throw new Error('No configuration found. Run "google-ads-cli setup" first.');
    }

    if (!profile.developer_token || !profile.customer_id) {
      throw new Error('Incomplete configuration. Run "google-ads-cli setup" again.');
    }

    this.client = new GoogleAdsApi({
      client_id: profile.client_id,
      client_secret: profile.client_secret,
      developer_token: profile.developer_token
    });
  }

  async initialize(): Promise<void> {
    const profile = configManager.getProfile(this.profileName);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const accessToken = await getValidToken(this.profileName);
    
    const customerOptions: any = {
      customer_id: profile.customer_id,
      refresh_token: profile.refresh_token
    };

    if (profile.login_customer_id) {
      customerOptions.login_customer_id = profile.login_customer_id;
    }

    this.customer = this.client.Customer(customerOptions);
  }

  getCustomer(): Customer {
    if (!this.customer) {
      throw new Error('API not initialized. Call initialize() first.');
    }
    return this.customer;
  }

  async listAccessibleCustomers(): Promise<any[]> {
    const customer = this.getCustomer();
    
    const query = `
      SELECT
        customer_client.client_customer,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.time_zone,
        customer_client.id
      FROM customer_client
      WHERE customer_client.status = 'ENABLED'
    `;

    try {
      const results = await customer.query(query);
      return results;
    } catch (error: any) {
      throw new Error(`Failed to list customers: ${error.message}`);
    }
  }

  async listCampaigns(limit: number = 50): Promise<any[]> {
    const customer = this.getCustomer();
    
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.start_date,
        campaign.end_date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.id DESC
      LIMIT ${limit}
    `;

    try {
      const results = await customer.query(query);
      return results;
    } catch (error: any) {
      throw new Error(`Failed to list campaigns: ${error.message}`);
    }
  }

  async getCampaign(campaignId: string): Promise<any> {
    const customer = this.getCustomer();
    
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.start_date,
        campaign.end_date,
        campaign.budget,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE campaign.id = ${campaignId}
    `;

    try {
      const results = await customer.query(query);
      return results[0] || null;
    } catch (error: any) {
      throw new Error(`Failed to get campaign: ${error.message}`);
    }
  }

  async listAdGroups(campaignId: string, limit: number = 50): Promise<any[]> {
    const customer = this.getCustomer();
    
    const query = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group.type,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM ad_group
      WHERE campaign.id = ${campaignId}
        AND ad_group.status != 'REMOVED'
      ORDER BY ad_group.id DESC
      LIMIT ${limit}
    `;

    try {
      const results = await customer.query(query);
      return results;
    } catch (error: any) {
      throw new Error(`Failed to list ad groups: ${error.message}`);
    }
  }

  async generateKeywordIdeas(params: {
    keywords?: string[];
    url?: string;
    language?: string;
    locations?: string[];
    pageSize?: number;
  }): Promise<any> {
    const customer = this.getCustomer();
    
    try {
      const keywordPlanIdeas = customer.keywordPlanIdeas;
      
      const request: any = {
        customer_id: configManager.getProfile(this.profileName)?.customer_id
      };

      if (params.keywords && params.keywords.length > 0) {
        request.keyword_seed = {
          keywords: params.keywords
        };
      }

      if (params.url) {
        request.url_seed = {
          url: params.url
        };
      }

      if (params.language) {
        request.language = params.language;
      }

      if (params.locations && params.locations.length > 0) {
        request.geo_target_constants = params.locations;
      }

      if (params.pageSize) {
        request.page_size = params.pageSize;
      }

      const results = await keywordPlanIdeas.generateKeywordIdeas(request);
      return results;
    } catch (error: any) {
      throw new Error(`Failed to generate keyword ideas: ${error.message}`);
    }
  }

  async searchGeoTargets(searchTerm: string, limit: number = 20): Promise<any[]> {
    const customer = this.getCustomer();
    
    const query = `
      SELECT
        geo_target_constant.id,
        geo_target_constant.name,
        geo_target_constant.country_code,
        geo_target_constant.target_type,
        geo_target_constant.canonical_name
      FROM geo_target_constant
      WHERE geo_target_constant.name LIKE '%${searchTerm}%'
      LIMIT ${limit}
    `;

    try {
      const results = await customer.query(query);
      return results;
    } catch (error: any) {
      throw new Error(`Failed to search geo targets: ${error.message}`);
    }
  }

  async executeQuery(query: string): Promise<any[]> {
    const customer = this.getCustomer();
    
    try {
      const results = await customer.query(query);
      return results;
    } catch (error: any) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }
}
