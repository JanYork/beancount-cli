/**
 * 配置管理器
 * 
 * 作者: JanYork
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface BeancountConfig {
  data: {
    default_file: string;
    data_dir: string;
    backup_dir: string;
    export_dir: string;
  };
  currency: {
    default: string;
    supported: string[];
    exchange_rate_api?: string;
  };
  accounts: {
    default_prefix: string;
    templates: {
      assets: string[];
      expenses: string[];
      income: string[];
    };
  };
  ui: {
    language: string;
    theme: string;
    show_emoji: boolean;
    show_colors: boolean;
    output_format: string;
  };
  features: {
    auto_backup: boolean;
    backup_frequency: string;
    enable_validation: boolean;
    auto_exchange_rate: boolean;
    enable_templates: boolean;
  };
  security: {
    encrypt_sensitive: boolean;
    hash_algorithm: string;
    session_timeout: number;
  };
  logging: {
    level: string;
    file: string;
    console: boolean;
    max_size: number;
    max_files: number;
  };
  plugins: {
    enabled: boolean;
    directory: string;
    auto_load: boolean;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: BeancountConfig;
  private configPath: string;

  private constructor() {
    this.configPath = this.getDefaultConfigPath();
    this.config = this.loadDefaultConfig();
    this.loadConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取配置
   */
  public getConfig(): BeancountConfig {
    return this.config;
  }

  /**
   * 获取配置值
   */
  public get<T>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value: any = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k && k in value) {
        value = value[k];
      } else {
        return defaultValue as T;
      }
    }
    
    return value;
  }

  /**
   * 设置配置值
   */
  public set<T>(key: string, value: T): void {
    const keys = key.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (k && (!(k in current) || typeof current[k] !== 'object')) {
        current[k] = {};
      }
      if (k) {
        current = current[k];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  }

  /**
   * 保存配置到文件
   */
  public saveConfig(): void {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // 将配置转换为YAML格式（简化版本）
      const yamlContent = this.configToYaml(this.config);
      fs.writeFileSync(this.configPath, yamlContent, 'utf8');
    } catch (error) {
      console.error('保存配置文件失败:', error);
    }
  }

  /**
   * 重新加载配置
   */
  public reloadConfig(): void {
    this.loadConfig();
  }

  /**
   * 获取默认配置文件路径
   */
  private getDefaultConfigPath(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, '.beancount-cli', 'config.yaml');
  }

  /**
   * 加载默认配置
   */
  private loadDefaultConfig(): BeancountConfig {
    return {
      data: {
        default_file: path.join(os.homedir(), 'beancount', 'main.beancount'),
        data_dir: path.join(os.homedir(), 'beancount', 'data'),
        backup_dir: path.join(os.homedir(), 'beancount', 'backups'),
        export_dir: path.join(os.homedir(), 'beancount', 'exports')
      },
      currency: {
        default: 'CNY',
        supported: ['CNY', 'USD', 'EUR', 'JPY', 'GBP'],
        exchange_rate_api: 'https://api.exchangerate-api.com/v4/latest/CNY'
      },
      accounts: {
        default_prefix: 'Assets:',
        templates: {
          assets: ['Assets:Cash', 'Assets:Bank', 'Assets:Investment'],
          expenses: ['Expenses:Food', 'Expenses:Transport', 'Expenses:Shopping'],
          income: ['Income:Salary', 'Income:Investment', 'Income:Other']
        }
      },
      ui: {
        language: 'zh-CN',
        theme: 'default',
        show_emoji: true,
        show_colors: true,
        output_format: 'table'
      },
      features: {
        auto_backup: true,
        backup_frequency: 'weekly',
        enable_validation: true,
        auto_exchange_rate: false,
        enable_templates: true
      },
      security: {
        encrypt_sensitive: false,
        hash_algorithm: 'sha256',
        session_timeout: 30
      },
      logging: {
        level: 'info',
        file: path.join(os.homedir(), 'beancount', 'logs', 'cli.log'),
        console: true,
        max_size: 10,
        max_files: 5
      },
      plugins: {
        enabled: false,
        directory: path.join(os.homedir(), 'beancount', 'plugins'),
        auto_load: false
      }
    };
  }

  /**
   * 加载配置文件
   */
  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf8');
        const loadedConfig = this.yamlToConfig(fileContent);
        this.config = { ...this.config, ...loadedConfig };
      } else {
        // 如果配置文件不存在，创建默认配置
        this.saveConfig();
      }
    } catch (error) {
      console.warn('加载配置文件失败，使用默认配置:', error);
    }
  }

  /**
   * 将配置转换为YAML格式（简化版本）
   */
  private configToYaml(config: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.configToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          yaml += `${spaces}  - ${item}\n`;
        }
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }

  /**
   * 将YAML转换为配置对象（简化版本）
   */
  private yamlToConfig(yaml: string): any {
    const config: any = {};
    const lines = yaml.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex);
      const value = trimmed.substring(colonIndex + 1).trim();
      
      if (value === '') {
        // 新的对象
        config[key] = {};
      } else if (value.startsWith('-')) {
        // 数组项
        if (!Array.isArray(config[key])) {
          config[key] = [];
        }
        config[key].push(value.substring(1).trim());
      } else {
        // 简单值
        config[key] = value;
      }
    }
    
    return config;
  }

  /**
   * 展开路径中的环境变量和用户目录
   */
  public expandPath(pathStr: string): string {
    if (pathStr.startsWith('~/')) {
      return pathStr.replace('~', os.homedir());
    }
    return pathStr;
  }

  /**
   * 获取配置文件的完整路径
   */
  public getConfigPath(): string {
    return this.configPath;
  }

  /**
   * 检查配置是否有效
   */
  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 检查必要的配置项
    if (!this.config.data.default_file) {
      errors.push('缺少默认beancount文件路径配置');
    }
    
    if (!this.config.currency.default) {
      errors.push('缺少默认货币配置');
    }
    
    if (!this.config.currency.supported.includes(this.config.currency.default)) {
      errors.push('默认货币不在支持的货币列表中');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 