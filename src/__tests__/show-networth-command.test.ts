/**
 * 显示净资产命令测试
 * 
 * 作者: JanYork
 */

import { ShowNetworthCommand } from '../commands/show-networth-command';
import { BeancountEngine } from '../engine/beancount-engine';

// Mock BeancountEngine
jest.mock('../engine/beancount-engine');

describe('ShowNetworthCommand', () => {
  let command: ShowNetworthCommand;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    // 清除所有mock
    jest.clearAllMocks();
    
    // 创建mock实例
    mockEngine = {
      getNetWorth: jest.fn()
    } as any;
    
    command = new ShowNetworthCommand(mockEngine);
  });

  describe('execute', () => {
    it('should show net worth when data exists', () => {
      const mockNetWorth = {
        assets: 10000,
        liabilities: 2000,
        netWorth: 8000
      };
      mockEngine.getNetWorth.mockReturnValue(mockNetWorth);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('净资产报告');
      expect(result.message).toContain('📈 资产:');
      expect(result.message).toContain('💳 负债:');
      expect(result.message).toContain('🏦 净资产:');
      expect(result.message).toContain('+10000.00 CNY');
      expect(result.message).toContain('-2000.00 CNY');
      expect(result.message).toContain('+8000.00 CNY');
    });

    it('should handle date parameter correctly', () => {
      const mockNetWorth = {
        assets: 5000,
        liabilities: 1000,
        netWorth: 4000
      };
      mockEngine.getNetWorth.mockReturnValue(mockNetWorth);

      const result = command.execute({ date: '2024-01-01' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('📅 报告日期: 2024-01-01');
    });

    it('should handle invalid date format', () => {
      const result = command.execute({ date: 'invalid-date' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('日期格式错误');
    });

    it('should handle null net worth data', () => {
      mockEngine.getNetWorth.mockReturnValue(null as any);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('无法计算净资产信息');
    });

    it('should handle negative net worth', () => {
      const mockNetWorth = {
        assets: 1000,
        liabilities: 3000,
        netWorth: -2000
      };
      mockEngine.getNetWorth.mockReturnValue(mockNetWorth);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('-2000.00 CNY');
    });

    it('should handle zero values', () => {
      const mockNetWorth = {
        assets: 0,
        liabilities: 0,
        netWorth: 0
      };
      mockEngine.getNetWorth.mockReturnValue(mockNetWorth);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('+0.00 CNY');
      expect(result.message).toContain('-0.00 CNY');
      expect(result.message).toContain('+0.00 CNY');
    });

    it('should handle decimal values', () => {
      const mockNetWorth = {
        assets: 1000.50,
        liabilities: 200.25,
        netWorth: 800.25
      };
      mockEngine.getNetWorth.mockReturnValue(mockNetWorth);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('+1000.50 CNY');
      expect(result.message).toContain('-200.25 CNY');
      expect(result.message).toContain('+800.25 CNY');
    });

    it('should handle engine errors gracefully', () => {
      mockEngine.getNetWorth.mockImplementation(() => {
        throw new Error('Engine error');
      });

      const result = command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('显示净资产失败');
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = command.getHelp();

      expect(help).toContain('显示净资产');
      expect(help).toContain('用法: /show_networth');
      expect(help).toContain('参数:');
      expect(help).toContain('功能:');
      expect(help).toContain('示例:');
    });
  });
}); 