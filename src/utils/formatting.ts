import Table from 'cli-table3';
import chalk from 'chalk';
import dayjs from 'dayjs';

export function formatTable(data: any[], columns: string[]): string {
  if (data.length === 0) {
    return chalk.yellow('No data to display');
  }

  const table = new Table({
    head: columns.map(c => chalk.cyan(c)),
    style: {
      head: [],
      border: ['gray']
    }
  });

  data.forEach(row => {
    table.push(columns.map(col => row[col] || '-'));
  });

  return table.toString();
}

export function formatJson(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount / 1000000); // Google Ads uses micro amounts
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDate(date: string | number | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

export function formatDateShort(date: string | number | Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

export function displaySuccess(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function displayError(message: string): void {
  console.log(chalk.red('✗'), message);
}

export function displayWarning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

export function displayInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}
