/**
 * check-structure-command 单元测试
 */
import { CheckStructureCommand } from '../commands/check-structure-command';
import { BeancountFileManager } from '../utils/file-manager';
import * as fs from 'fs';

// Mock dependencies
jest.mock('../utils/file-manager');
jest.mock('fs');
jest.mock('path');

describe('CheckStructureCommand', () => {
  let command: CheckStructureCommand;
  const mockFileManager = BeancountFileManager as jest.MockedClass<typeof BeancountFileManager>;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fs.existsSync to return true for all files
    mockFs.existsSync.mockReturnValue(true);

    // Mock fs.readdirSync to return empty array
    mockFs.readdirSync.mockReturnValue([]);

    // Mock fs.statSync to return directory stats
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
      isFile: () => false,
    } as any);

    // Mock FileManager
    const mockInstance = {
      getStructureInfo: jest.fn().mockReturnValue({
        root: '/test/root',
        main: '/test/root/main.beancount',
        config: {
          accounts: '/test/root/config/accounts.beancount',
          commodities: '/test/root/config/commodities.beancount',
          plugins: '/test/root/config/plugins.beancount',
        },
        data: {
          openingBalances: '/test/root/data/opening-balances.beancount',
        },
        rules: {
          priceSources: '/test/root/rules/price-sources.beancount',
          importers: '/test/root/rules/importers.beancount',
        },
        reports: {
          queries: '/test/root/reports/queries.bql',
          customReports: '/test/root/reports/custom-reports.beancount',
        },
      }),
      validateStructure: jest.fn().mockReturnValue({
        valid: true,
        missing: [],
        issues: [],
      }),
      getAllTemplates: jest.fn().mockReturnValue([]),
      createYearStructure: jest.fn(),
    };

    mockFileManager.mockImplementation(() => mockInstance as any);

    command = new CheckStructureCommand();
    (command as any).fileManager = mockInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should check structure with default parameters', async () => {
      const result = await command.execute({});

      expect(mockFileManager).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toContain('✅ 文件结构完整，所有必要文件都存在');
    });

    it('should check structure with custom path', async () => {
      const result = await command.execute({ path: '/custom/path' });

      expect(mockFileManager).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should show missing files when structure is invalid', async () => {
      const mockInstance = {
        getStructureInfo: jest.fn().mockReturnValue({
          root: '/test/root',
          main: '/test/root/main.beancount',
          config: {
            accounts: '/test/root/config/accounts.beancount',
            commodities: '/test/root/config/commodities.beancount',
            plugins: '/test/root/config/plugins.beancount',
          },
          data: {
            openingBalances: '/test/root/data/opening-balances.beancount',
          },
          rules: {
            priceSources: '/test/root/rules/price-sources.beancount',
            importers: '/test/root/rules/importers.beancount',
          },
          reports: {
            queries: '/test/root/reports/queries.bql',
            customReports: '/test/root/reports/custom-reports.beancount',
          },
        }),
        validateStructure: jest.fn().mockReturnValue({
          valid: false,
          missing: ['config/accounts.beancount', 'data/opening-balances.beancount'],
          issues: ['当前年度 2024 的数据目录不存在'],
        }),
        getAllTemplates: jest.fn().mockReturnValue([]),
        createYearStructure: jest.fn(),
      };

      mockFileManager.mockImplementation(() => mockInstance as any);
      (command as any).fileManager = mockInstance;

      const result = await command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('❌ 文件结构不完整');
      expect(result.message).toContain('config/accounts.beancount');
      expect(result.message).toContain('当前年度 2024 的数据目录不存在');
    });

    it('should auto-fix when fix=true', async () => {
      const mockInstance = {
        getStructureInfo: jest.fn().mockReturnValue({
          root: '/test/root',
          main: '/test/root/main.beancount',
          config: {
            accounts: '/test/root/config/accounts.beancount',
            commodities: '/test/root/config/commodities.beancount',
            plugins: '/test/root/config/plugins.beancount',
          },
          data: {
            openingBalances: '/test/root/data/opening-balances.beancount',
          },
          rules: {
            priceSources: '/test/root/rules/price-sources.beancount',
            importers: '/test/root/rules/importers.beancount',
          },
          reports: {
            queries: '/test/root/reports/queries.bql',
            customReports: '/test/root/reports/custom-reports.beancount',
          },
        }),
        validateStructure: jest.fn().mockReturnValue({
          valid: false,
          missing: ['config/accounts.beancount'],
          issues: [],
        }),
        createDirectoryStructure: jest.fn(),
        getAllTemplates: jest.fn().mockReturnValue([]),
        createYearStructure: jest.fn(),
      };

      mockFileManager.mockImplementation(() => mockInstance as any);
      (command as any).fileManager = mockInstance;

      const result = await command.execute({ fix: true });

      expect(result.success).toBe(true);
      expect(result.message).toContain('🔧 正在尝试自动修复');
    });

    it('should handle errors gracefully', async () => {
      // Mock the fileManager instance to throw error during method calls
      const mockInstance = {
        getStructureInfo: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
        validateStructure: jest.fn().mockReturnValue({
          valid: true,
          missing: [],
          issues: [],
        }),
        getAllTemplates: jest.fn().mockReturnValue([]),
        createYearStructure: jest.fn(),
      };

      (command as any).fileManager = mockInstance;

      const result = await command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('检查文件结构失败');
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = command.getHelp();

      expect(help).toContain('检查 Beancount 文件结构');
      expect(help).toContain('用法: /check_structure');
      expect(help).toContain('path=<路径>');
      expect(help).toContain('fix=true');
    });
  });
});
