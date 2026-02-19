import { OAuth2Client } from 'google-auth-library';
import express from 'express';
import { Server } from 'http';
import open from 'open';
import chalk from 'chalk';
import ora from 'ora';

const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/adwords'];

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export class OAuthManager {
  private oauth2Client: OAuth2Client;
  private port: number;

  constructor(clientId: string, clientSecret: string, port: number = 3000) {
    this.port = port;
    const redirectUri = `http://localhost:${port}/oauth2callback`;
    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async authorize(): Promise<OAuthTokens> {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });

    console.log(chalk.cyan('\n🔐 Opening browser for authentication...\n'));
    console.log(chalk.gray('If the browser does not open, visit this URL:'));
    console.log(chalk.blue(authUrl));
    console.log();

    const spinner = ora('Waiting for authorization...').start();

    try {
      const code = await this.waitForAuthCode();
      spinner.text = 'Exchanging authorization code for tokens...';
      
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      spinner.succeed('Authorization successful!');
      
      return {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token || undefined,
        expiry_date: tokens.expiry_date || undefined
      };
    } catch (error) {
      spinner.fail('Authorization failed');
      throw error;
    }
  }

  private async waitForAuthCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      const app = express();
      let server: Server;

      app.get('/oauth2callback', (req, res) => {
        const code = req.query.code as string;
        
        if (!code) {
          res.send('❌ Authorization failed: No code received');
          reject(new Error('No authorization code received'));
          return;
        }

        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authorization Successful</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .container {
                  background: white;
                  padding: 3rem;
                  border-radius: 12px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                  text-align: center;
                  max-width: 500px;
                }
                .checkmark {
                  font-size: 4rem;
                  color: #4caf50;
                  margin-bottom: 1rem;
                }
                h1 {
                  color: #333;
                  margin: 0 0 1rem 0;
                }
                p {
                  color: #666;
                  margin: 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="checkmark">✓</div>
                <h1>Authorization Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
              </div>
            </body>
          </html>
        `);

        server.close();
        resolve(code);
      });

      server = app.listen(this.port, async () => {
        const authUrl = this.oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
          prompt: 'consent'
        });

        try {
          await open(authUrl);
        } catch (error) {
          console.log(chalk.yellow('\nCould not open browser automatically.'));
        }
      });

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${this.port} is already in use. Try a different port.`));
        } else {
          reject(error);
        }
      });
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    
    return {
      access_token: credentials.access_token!,
      refresh_token: credentials.refresh_token || refreshToken,
      expiry_date: credentials.expiry_date || undefined
    };
  }

  isTokenExpired(expiryDate?: number): boolean {
    if (!expiryDate) return true;
    // Consider token expired if it expires in less than 5 minutes
    return Date.now() >= expiryDate - 5 * 60 * 1000;
  }
}
