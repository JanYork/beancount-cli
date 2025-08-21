/**
 * 验证命令测试
 * 
 * 作者: JanYork
 */

import { ValidateCommand } from '../commands/validate-command';
import { BeancountEngine } from '../engine/beancount-engine';

// Mock BeancountEngine
jest.mock('../engine/beancount-engine');

describe('ValidateCommand', () => {
  let command: ValidateCommand;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    // 清除所有mock
    jest.clearAllMocks();
    
    // 创建mock实例
    mockEngine = {
      getFileStats: jest.fn()
    } as any;
    
    command = new ValidateCommand(mockEngine);
  });

  describe('execute', () => {
    it('should show success when no errors found', () => {
      const mockStats = {
        totalErrors: 0
      };
      mockEngine.getFileStats.mockReturnValue(mockStats);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('文件验证通过');
      expect(result.message).toContain('语法正确');
      expect(result.message).toContain('账户平衡');
      expect(result.message).toContain('格式规范');
    });

    it('should show errors when validation fails', () => {
      const mockStats = {
        totalErrors: 3
      };
      mockEngine.getFileStats.mockReturnValue(mockStats);

      const result = command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件验证失败');
      expect(result.message).toContain('发现 3 个错误');
      expect(result.message).toContain('建议: 请检查文件中的错误并修复后重新验证');
    });

    it('should handle zero errors correctly', () => {
      const mockStats = {
        totalErrors: 0
      };
      mockEngine.getFileStats.mockReturnValue(mockStats);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('文件验证通过');
    });

    it('should handle single error correctly', () => {
      const mockStats = {
        totalErrors: 1
      };
      mockEngine.getFileStats.mockReturnValue(mockStats);

      const result = command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('发现 1 个错误');
    });

    it('should handle engine errors gracefully', () => {
      mockEngine.getFileStats.mockImplementation(() => {
        throw new Error('Engine error');
      });

      const result = command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('验证文件失败');
    });

    it('should handle missing totalErrors property', () => {
      const mockStats = {};
      mockEngine.getFileStats.mockReturnValue(mockStats);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('文件验证通过');
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = command.getHelp();

      expect(help).toContain('验证beancount文件');
      expect(help).toContain('用法: /validate');
      expect(help).toContain('功能:');
      expect(help).toContain('验证内容:');
      expect(help).toContain('示例:');
    });
  });
}); 