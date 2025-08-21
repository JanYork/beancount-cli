/**
 * init-structure-command 单元测试
 */
import { InitStructureCommand } from '../commands/init-structure-command';
import { BeancountFileManager } from '../utils/file-manager';
import { ConfigManager } from '../utils/config-manager';
import inquirer from 'inquirer';

// Mock dependencies
jest.mock('../utils/file-manager');
jest.mock('../utils/config-manager');
jest.mock('inquirer');

describe('InitStructureCommand', () => {
  let command: InitStructureCommand;
  const mockFileManager = BeancountFileManager as jest.MockedClass<typeof BeancountFileManager>;
  const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;
  const mockInquirer = inquirer as jest.Mocked<typeof inquirer>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock ConfigManager
    (mockConfigManager.getInstance as jest.Mock).mockReturnValue({
      set: jest.fn(),
      saveConfig: jest.fn(),
    } as any);

    // Mock FileManager
    mockFileManager.mockImplementation(() => ({
      getStructureInfo: jest.fn().mockReturnValue({
        root: '/test/root',
        main: '/test/root/main.beancount',
      }),
      validateStructure: jest.fn().mockReturnValue({
        valid: false,
        missing: ['file1', 'file2'],
        issues: [],
      }),
      initializeFullStructure: jest.fn(),
    } as any));

    command = new InitStructureCommand();
  });

  describe('execute', () => {
    it('should initialize structure with default parameters', async () => {
      mockInquirer.prompt.mockResolvedValue({ confirmOverwrite: true });

      const result = await command.execute({});

      expect(mockFileManager).toHaveBeenCalled();
      expect(mockConfigManager.getInstance).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toContain('✅ Beancount 多文件结构初始化完成！');
    });

    it('should initialize structure with custom path', async () => {
      mockInquirer.prompt.mockResolvedValue({ confirmOverwrite: true });

      const result = await command.execute({ path: '/custom/path' });

      expect(mockFileManager).toHaveBeenCalledWith('/custom/path');
      expect(result.success).toBe(true);
    });

    it('should initialize structure with custom year', async () => {
      mockInquirer.prompt.mockResolvedValue({ confirmOverwrite: true });

      const result = await command.execute({ year: '2023' });

      expect(result.success).toBe(true);
    });

    it('should force overwrite when force=true', async () => {
      const result = await command.execute({ force: true });

      expect(mockInquirer.prompt).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should cancel when user does not confirm overwrite', async () => {
      mockInquirer.prompt.mockResolvedValue({ confirmOverwrite: false });

      const result = await command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('操作已取消');
    });

    it('should handle errors gracefully', async () => {
      // Mock inquirer to return true for confirmation
      mockInquirer.prompt.mockResolvedValue({ confirmOverwrite: true });

      // Mock FileManager to throw error during initialization
      const mockInstance = {
        getStructureInfo: jest.fn().mockReturnValue({
          root: '/test/root',
          main: '/test/root/main.beancount',
        }),
        validateStructure: jest.fn().mockReturnValue({
          valid: false,
          missing: ['file1', 'file2'],
          issues: [],
        }),
        initializeFullStructure: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
      };

      mockFileManager.mockImplementation(() => mockInstance as any);
      (command as any).fileManager = mockInstance;

      const result = await command.execute({ force: true });

      expect(result.success).toBe(false);
      expect(result.message).toContain('初始化文件结构失败');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = command.getHelp();

      expect(help).toContain('初始化 Beancount 多文件结构');
      expect(help).toContain('用法: /init_structure');
      expect(help).toContain('path=<路径>');
      expect(help).toContain('year=<年份>');
      expect(help).toContain('force=true');
    });
  });
});
