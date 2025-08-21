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
      expandPath: jest.fn(),
      setLanguage: jest.fn(),
    } as any;

    // Mock getInstance方法
    (ConfigManager.getInstance as jest.Mock).mockReturnValue(mockConfigManager);

    command = new ConfigCommand();
  });

  describe('execute', () => {
    it('should show all config when no action specified', async () => {
      const mockConfig = {
        data: { default_file: 'test.beancount', data_dir: '', backup_dir: '', export_dir: '' },
        currency: { default: 'CNY', supported: [] },
        accounts: { default_prefix: '', templates: { assets: [], expenses: [], income: [] } },
        ui: { language: '', theme: '', show_emoji: false, show_colors: false, output_format: '' },
        features: {
          auto_backup: false,
          backup_frequency: '',
          enable_validation: false,
          auto_exchange_rate: false,
          enable_templates: false,
        },
        security: { encrypt_sensitive: false, hash_algorithm: '', session_timeout: 0 },
        logging: { level: '', file: '', console: false, max_size: 0, max_files: 0 },
        plugins: { enabled: false, directory: '', auto_load: false },
      } as any;
      mockConfigManager.getConfig.mockReturnValue(mockConfig);

      const result = await command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('语言:');
      expect(result.message).toContain('默认货币:');
    });

    it('should handle invalid action', async () => {
      const result = await command.execute({ action: 'invalid' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('未知的配置操作: invalid');
    });

    it('should handle language setting', async () => {
      const result = await command.execute({ action: 'language', language: 'en-US' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('语言已设置为: en-US');
    });

    it('should handle unsupported language', async () => {
      const result = await command.execute({ action: 'language', language: 'fr-FR' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('不支持的语言: fr-FR');
    });

    it('should handle edit action', async () => {
      const result = await command.execute({ action: 'edit' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('配置编辑功能开发中');
    });

    it('should handle language setting with error', async () => {
      mockConfigManager.setLanguage.mockImplementation(() => {
        throw new Error('Language setting failed');
      });

      const result = await command.execute({ action: 'language', language: 'en-US' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('配置操作失败');
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = command.getHelp();

      expect(help).toContain('配置管理');
      expect(help).toContain('用法: /config');
      expect(help).toContain('操作:');
      expect(help).toContain('操作:');
      expect(help).toContain('示例:');
    });
  });
});
