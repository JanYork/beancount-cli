/**
 * 配置服务
 * 提供类型安全的配置管理，支持配置验证和热重载
 * 
 * @author JanYork
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import { Result } from '../../core/shared/result';

/**
 * 配置接口定义
 */
export interface BeancountConfiguration {
  data: {
    default_file: string;
    default_file_dir: string;
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
    language: 'zh-CN' | 'en-US';
    theme: string;
    show_emoji: boolean;
    show_colors: boolean;
    output_format: string;
  };
  features: {
    auto_backup: boolean;
    backup_frequency: 'daily' | 'weekly' | 'monthly';
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
    level: 'debug' | 'info' | 'warn' | 'error';
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

/**
 * 配置服务类
 * 提供类型安全的配置管理
 */
export class ConfigurationService {
  private static instance: ConfigurationService;
  private config: BeancountConfiguration;
  private readonly configPath: string;
  private readonly defaultConfig: BeancountConfiguration;

  private constructor() {
    this.configPath = this.getDefaultConfigPath();
    this.defaultConfig = this.createDefaultConfiguration();
    this.config = { ...this.defaultConfig };
    this.loadConfiguration();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * 获取配置值
   * @param key 配置键路径，使用点号分隔
   * @returns 配置值
   */
  get<T>(key: string): T {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k && k in value) {
        value = value[k];
      } else {
        throw new Error(`配置键不存在: ${key}`);
      }
    }

    return value as T;
  }

  /**
   * 获取配置值，如果不存在则返回默认值
   * @param key 配置键路径
   * @param defaultValue 默认值
   * @returns 配置值或默认值
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    try {
      return this.get<T>(key);
    } catch {
      return defaultValue;
    }
  }

  /**
   * 设置配置值
   * @param key 配置键路径
   * @param value 配置值
   */
  set<T>(key: string, value: T): Result<void> {
    try {
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

      return Result.success(undefined);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '设置配置失败');
    }
  }

  /**
   * 重新加载配置
   */
  reload(): Result<void> {
    try {
      this.loadConfiguration();
      return Result.success(undefined);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '重新加载配置失败');
    }
  }

  /**
   * 保存配置到文件
   */
  save(): Result<void> {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const yamlContent = yaml.dump(this.config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      });
      fs.writeFileSync(this.configPath, yamlContent, 'utf8');

      return Result.success(undefined);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '保存配置失败');
    }
  }

  /**
   * 验证配置
   */
  validate(): Result<BeancountConfiguration> {
    try {
      const errors: string[] = [];

      // 验证必要配置
      if (!this.config.data.default_file) {
        errors.push('缺少默认beancount文件路径配置');
      }

      if (!this.config.currency.default) {
        errors.push('缺少默认货币配置');
      }

      if (!this.config.currency.supported.includes(this.config.currency.default)) {
        errors.push('默认货币不在支持的货币列表中');
      }

      if (this.config.security.session_timeout < 1) {
        errors.push('会话超时时间必须大于0');
      }

      if (this.config.logging.max_size < 1) {
        errors.push('日志文件最大大小必须大于0');
      }

      if (this.config.logging.max_files < 1) {
        errors.push('保留日志文件数量必须大于0');
      }

      if (errors.length > 0) {
        return Result.failure(`配置验证失败: ${errors.join(', ')}`);
      }

      return Result.success(this.config);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '配置验证失败');
    }
  }

  /**
   * 获取完整配置
   */
  getConfiguration(): BeancountConfiguration {
    return { ...this.config };
  }

  /**
   * 重置为默认配置
   */
  resetToDefault(): Result<void> {
    try {
      this.config = { ...this.defaultConfig };
      return Result.success(undefined);
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '重置配置失败');
    }
  }

  /**
   * 展开路径中的环境变量和用户目录
   */
  expandPath(pathStr: string): string {
    if (pathStr.startsWith('~/')) {
      return pathStr.replace('~', os.homedir());
    }
    return pathStr;
  }

  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfiguration(): BeancountConfiguration {
    return {
      data: {
        default_file: path.join(os.homedir(), 'beancount', 'main.beancount'),
        default_file_dir: path.join(os.homedir(), 'beancount'),
        data_dir: path.join(os.homedir(), 'beancount', 'data'),
        backup_dir: path.join(os.homedir(), 'beancount', 'backups'),
        export_dir: path.join(os.homedir(), 'beancount', 'exports'),
      },
      currency: {
        default: 'CNY',
        supported: ['CNY', 'USD', 'EUR', 'JPY', 'GBP'],
        exchange_rate_api: 'https://api.exchangerate-api.com/v4/latest/CNY',
      },
      accounts: {
        default_prefix: 'Assets:',
        templates: {
          assets: ['Assets:Cash', 'Assets:Bank', 'Assets:Investment'],
          expenses: ['Expenses:Food', 'Expenses:Transport', 'Expenses:Shopping'],
          income: ['Income:Salary', 'Income:Investment', 'Income:Other'],
        },
      },
      ui: {
        language: 'zh-CN',
        theme: 'default',
        show_emoji: true,
        show_colors: true,
        output_format: 'table',
      },
      features: {
        auto_backup: true,
        backup_frequency: 'weekly',
        enable_validation: true,
        auto_exchange_rate: false,
        enable_templates: true,
      },
      security: {
        encrypt_sensitive: false,
        hash_algorithm: 'sha256',
        session_timeout: 30,
      },
      logging: {
        level: 'info',
        file: path.join(os.homedir(), 'beancount', 'logs', 'cli.log'),
        console: true,
        max_size: 10,
        max_files: 5,
      },
      plugins: {
        enabled: false,
        directory: path.join(os.homedir(), 'beancount', 'plugins'),
        auto_load: false,
      },
    };
  }

  /**
   * 获取默认配置文件路径
   */
  private getDefaultConfigPath(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, '.beancount-cli', 'config.yaml');
  }

  /**
   * 加载配置文件
   */
  private loadConfiguration(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf8');
        const loadedConfig = yaml.load(fileContent) as Partial<BeancountConfiguration>;
        this.config = this.mergeConfigurations(this.defaultConfig, loadedConfig);
      } else {
        // 如果配置文件不存在，创建默认配置
        console.log('⚙️  首次运行，创建默认配置文件...');
        this.save();
        console.log(`✅ 配置文件已创建: ${this.configPath}`);
      }
    } catch (error) {
      console.warn('加载配置文件失败，使用默认配置:', error);
    }
  }

  /**
   * 合并配置
   */
  private mergeConfigurations(
    defaultConfig: BeancountConfiguration,
    userConfig: Partial<BeancountConfiguration>
  ): BeancountConfiguration {
    return {
      ...defaultConfig,
      ...userConfig,
      data: { ...defaultConfig.data, ...userConfig.data },
      currency: { ...defaultConfig.currency, ...userConfig.currency },
      accounts: { ...defaultConfig.accounts, ...userConfig.accounts },
      ui: { ...defaultConfig.ui, ...userConfig.ui },
      features: { ...defaultConfig.features, ...userConfig.features },
      security: { ...defaultConfig.security, ...userConfig.security },
      logging: { ...defaultConfig.logging, ...userConfig.logging },
      plugins: { ...defaultConfig.plugins, ...userConfig.plugins },
    };
  }
} 