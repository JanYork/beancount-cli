/**
 * file-manager 单元测试
 */
import { BeancountFileManager } from '../utils/file-manager';
import { ConfigManager } from '../utils/config-manager';
import * as fs from 'fs';


// Mock fs
jest.mock('fs');
jest.mock('../utils/config-manager');

describe('BeancountFileManager', () => {
  let fileManager: BeancountFileManager;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });

    // Mock ConfigManager
    (mockConfigManager.getInstance as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('/test/path'),
    } as any);

    fileManager = new BeancountFileManager('/test/root');
  });

  describe('constructor', () => {
    it('should initialize with custom path', () => {
      const structure = fileManager.getStructureInfo();
      expect(structure.root).toBe('/test/root');
    });

    it('should initialize with default path', () => {
      (mockConfigManager.getInstance as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue('/default/path'),
      } as any);

      const manager = new BeancountFileManager();
      const structure = manager.getStructureInfo();
      expect(structure.root).toBe('/default/path');
    });
  });

  describe('createDirectoryStructure', () => {
    it('should create directories when they do not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      fileManager.createDirectoryStructure();

      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('创建目录'));
    });

    it('should not create directories when they exist', () => {
      mockFs.existsSync.mockReturnValue(true);

      fileManager.createDirectoryStructure();

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('generateMainFileTemplate', () => {
    it('should generate main file template', () => {
      const template = fileManager.generateMainFileTemplate();

      expect(template).toContain('Beancount 主文件');
      expect(template).toContain('option "title"');
      expect(template).toContain('include "config/accounts.beancount"');
    });
  });

  describe('generateAccountsTemplate', () => {
    it('should generate accounts template', () => {
      const template = fileManager.generateAccountsTemplate();

      expect(template).toContain('账户定义文件');
      expect(template).toContain('Assets:Current:Checking');
      expect(template).toContain('Expenses:Food:Dining');
    });
  });

  describe('generateCommoditiesTemplate', () => {
    it('should generate commodities template', () => {
      const template = fileManager.generateCommoditiesTemplate();

      expect(template).toContain('商品和货币定义文件');
      expect(template).toContain('commodity CNY');
      expect(template).toContain('commodity USD');
    });
  });

  describe('generatePluginsTemplate', () => {
    it('should generate plugins template', () => {
      const template = fileManager.generatePluginsTemplate();

      expect(template).toContain('插件配置文件');
      expect(template).toContain('plugin "beancount.plugins.auto_accounts"');
    });
  });

  describe('generateOpeningBalancesTemplate', () => {
    it('should generate opening balances template', () => {
      const template = fileManager.generateOpeningBalancesTemplate();

      expect(template).toContain('期初余额文件');
      expect(template).toContain('期初余额');
      expect(template).toContain('Assets:Current:Checking');
    });
  });

  describe('generateMonthlyTemplate', () => {
    it('should generate monthly template', () => {
      const template = fileManager.generateMonthlyTemplate(2024, 1);

      expect(template).toContain('2024年01月交易记录');
      expect(template).toContain('2024-01-01');
    });
  });

  describe('createYearStructure', () => {
    it('should create year structure', () => {
      mockFs.existsSync.mockReturnValue(false);

      fileManager.createYearStructure(2024);

      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('创建年度目录'));
    });

    it('should not create existing year structure', () => {
      mockFs.existsSync.mockReturnValue(true);

      fileManager.createYearStructure(2024);

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', () => {
      const templates = fileManager.getAllTemplates();

      expect(templates).toHaveLength(5);
      expect(templates[0]?.description).toBe('主文件，包含所有其他文件');
      expect(templates[1]?.description).toBe('账户定义文件');
    });
  });

  describe('initializeFullStructure', () => {
    it('should initialize full structure', () => {
      mockFs.existsSync.mockReturnValue(false);

      fileManager.initializeFullStructure(2024);

      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('🚀 初始化 Beancount 多文件结构...');
    });
  });

  describe('updateMainFileIncludes', () => {
    it('should update main file includes', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['2024'] as any);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);

      fileManager.updateMainFileIncludes();

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ 主文件 include 语句已更新');
    });

    it('should warn when main file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      fileManager.updateMainFileIncludes();

      expect(console.warn).toHaveBeenCalledWith('⚠️  主文件不存在，请先初始化文件结构');
    });
  });

  describe('validateStructure', () => {
    it('should return valid when all files exist', () => {
      mockFs.existsSync.mockReturnValue(true);

      const result = fileManager.validateStructure();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return invalid when files are missing', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = fileManager.validateStructure();

      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });

    it('should detect missing current year directory', () => {
      // Mock 当前年份为 2024
      const originalDate = global.Date;
      global.Date = class extends Date {
        constructor() {
          super();
        }
        override getFullYear() {
          return 2024;
        }
      } as any;

      mockFs.existsSync.mockImplementation((path: any) => {
        if (path.includes('2024')) return false;
        return true;
      });

      const result = fileManager.validateStructure();

      // 由于 mock 设置，2024 目录不存在，所以验证应该失败
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('当前年度 2024 的数据目录不存在');

      // 恢复 Date
      global.Date = originalDate;
    });
  });

  describe('getStructureInfo', () => {
    it('should return structure info', () => {
      const structure = fileManager.getStructureInfo();

      expect(structure.root).toBe('/test/root');
      expect(structure.main).toBe('/test/root/main.beancount');
      expect(structure.config.accounts).toBe('/test/root/config/accounts.beancount');
    });
  });
});
