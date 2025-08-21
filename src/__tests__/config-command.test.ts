/**
 * 配置命令测试
 * 
 * 作者: JanYork
 */

import { ConfigCommand } from '../commands/config-command';
import { ConfigManager } from '../utils/config-manager';

// Mock ConfigManager
jest.mock('../utils/config-manager');

describe('ConfigCommand', () => {
  let command: ConfigCommand;
  let mockConfigManager: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    // 清除所有mock
    jest.clearAllMocks();
    
    // 创建mock实例
    mockConfigManager = {
      getConfig: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      saveConfig: jest.fn(),
      reloadConfig: jest.fn(),
      validateConfig: jest.fn(),
      getConfigPath: jest.fn(),
      expandPath: jest.fn()
    } as any;

    // Mock getInstance方法
    (ConfigManager.getInstance as jest.Mock).mockReturnValue(mockConfigManager);
    
    command = new ConfigCommand();
  });

  describe('execute', () => {
    it('should show all config when no action specified', () => {
      const mockConfig = {
        data: { default_file: 'test.beancount', data_dir: '', backup_dir: '', export_dir: '' },
        currency: { default: 'CNY', supported: [] },
        accounts: { default_prefix: '', templates: { assets: [], expenses: [], income: [] } },
        ui: { language: '', theme: '', show_emoji: false, show_colors: false, output_format: '' },
        features: { auto_backup: false, backup_frequency: '', enable_validation: false, auto_exchange_rate: false, enable_templates: false },
        security: { encrypt_sensitive: false, hash_algorithm: '', session_timeout: 0 },
        logging: { level: '', file: '', console: false, max_size: 0, max_files: 0 },
        plugins: { enabled: false, directory: '', auto_load: false }
      } as any;
      mockConfigManager.getConfig.mockReturnValue(mockConfig);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('data:');
      expect(result.message).toContain('currency:');
    });

    it('should show specific config when key specified', () => {
      mockConfigManager.get.mockReturnValue('CNY');

      const result = command.execute({ action: 'show', key: 'currency.default' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('currency.default');
      expect(result.message).toContain('CNY');
    });

    it('should get config value', () => {
      mockConfigManager.get.mockReturnValue('CNY');

      const result = command.execute({ action: 'get', key: 'currency.default' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('currency.default');
      expect(result.message).toContain('CNY');
    });

    it('should set config value', () => {
      const result = command.execute({ 
        action: 'set', 
        key: 'currency.default', 
        value: 'USD' 
      });

      expect(result.success).toBe(true);
      expect(mockConfigManager.set).toHaveBeenCalledWith('currency.default', 'USD');
      expect(mockConfigManager.saveConfig).toHaveBeenCalled();
    });

    it('should reload config', () => {
      const result = command.execute({ action: 'reload' });

      expect(result.success).toBe(true);
      expect(mockConfigManager.reloadConfig).toHaveBeenCalled();
    });

    it('should validate config', () => {
      mockConfigManager.validateConfig.mockReturnValue({ valid: true, errors: [] });

      const result = command.execute({ action: 'validate' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('配置验证通过');
    });

    it('should show config path', () => {
      mockConfigManager.getConfigPath.mockReturnValue('/path/to/config.yaml');

      const result = command.execute({ action: 'path' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('/path/to/config.yaml');
    });

    it('should handle invalid action', () => {
      const result = command.execute({ action: 'invalid' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('无效的操作');
    });

    it('should handle missing key for get action', () => {
      const result = command.execute({ action: 'get' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少配置项名称');
    });

    it('should handle missing key for set action', () => {
      const result = command.execute({ action: 'set', value: 'USD' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少配置项名称');
    });

    it('should handle missing value for set action', () => {
      const result = command.execute({ action: 'set', key: 'currency.default' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少配置值');
    });

    it('should parse numeric values correctly', () => {
      const result = command.execute({ 
        action: 'set', 
        key: 'logging.max_size', 
        value: '20' 
      });

      expect(result.success).toBe(true);
      expect(mockConfigManager.set).toHaveBeenCalledWith('logging.max_size', 20);
    });

    it('should parse boolean values correctly', () => {
      const result = command.execute({ 
        action: 'set', 
        key: 'ui.show_emoji', 
        value: 'false' 
      });

      expect(result.success).toBe(true);
      expect(mockConfigManager.set).toHaveBeenCalledWith('ui.show_emoji', false);
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = command.getHelp();

      expect(help).toContain('配置管理');
      expect(help).toContain('用法: /config');
      expect(help).toContain('操作:');
      expect(help).toContain('参数:');
      expect(help).toContain('示例:');
    });
  });
}); 