/**
 * 列出账户命令测试
 *
 * 作者: JanYork
 */

import { ListAccountsCommand } from '../commands/list-accounts-command';
import { BeancountEngine } from '../engine/beancount-engine';

// Mock BeancountEngine
jest.mock('../engine/beancount-engine');

describe('ListAccountsCommand', () => {
  let command: ListAccountsCommand;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    // 清除所有mock
    jest.clearAllMocks();

    // 创建mock实例
    mockEngine = {
      getAccounts: jest.fn(),
    } as any;

    command = new ListAccountsCommand(mockEngine);
  });

  describe('execute', () => {
    it('should list all accounts when accounts exist', () => {
      const mockAccounts = [
        { name: 'Assets:Cash', type: 'ASSETS' as any, openDate: new Date(), meta: {} },
        { name: 'Expenses:Food', type: 'EXPENSES' as any, openDate: new Date(), meta: {} },
        { name: 'Income:Salary', type: 'INCOME' as any, openDate: new Date(), meta: {} },
      ];
      mockEngine.getAccounts.mockReturnValue(mockAccounts);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('找到 3 个账户');
      expect(result.message).toContain('💰 资产账户');
      expect(result.message).toContain('💸 支出账户');
      expect(result.message).toContain('📈 收入账户');
      expect(result.message).toContain('现金');
      expect(result.message).toContain('餐饮');
      expect(result.message).toContain('工资');
    });

    it('should handle empty accounts list', () => {
      mockEngine.getAccounts.mockReturnValue([]);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('没有找到账户信息');
    });

    it('should group accounts by type correctly', () => {
      const mockAccounts = [
        { name: 'Assets:Cash', type: 'ASSETS' as any, openDate: new Date(), meta: {} },
        { name: 'Liabilities:Credit', type: 'LIABILITIES' as any, openDate: new Date(), meta: {} },
        { name: 'Equity:Opening', type: 'EQUITY' as any, openDate: new Date(), meta: {} },
      ];
      mockEngine.getAccounts.mockReturnValue(mockAccounts);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('💰 资产账户');
      expect(result.message).toContain('💳 负债账户');
      expect(result.message).toContain('🏦 权益账户');
    });

    it('should handle unknown account types', () => {
      const mockAccounts = [{ name: 'Unknown:Account', type: 'UNKNOWN' as any, openDate: new Date(), meta: {} }];
      mockEngine.getAccounts.mockReturnValue(mockAccounts);

      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('❓ 其他账户');
      expect(result.message).toContain('Unknown:Account');
    });

    it('should handle engine errors gracefully', () => {
      mockEngine.getAccounts.mockImplementation(() => {
        throw new Error('Engine error');
      });

      const result = command.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('列出账户失败');
    });
  });

  describe('getHelp', () => {
    it('should return help information', () => {
      const help = command.getHelp();

      expect(help).toContain('列出所有账户');
      expect(help).toContain('用法: /list_accounts');
      expect(help).toContain('功能:');
      expect(help).toContain('示例:');
    });
  });

  describe('getAccountType', () => {
    it('should categorize Assets accounts correctly', () => {
      const result = (command as any).getAccountType('Assets:Cash', 'zh-CN');
      expect(result).toBe('💰 资产账户');
    });

    it('should categorize Liabilities accounts correctly', () => {
      const result = (command as any).getAccountType('Liabilities:Credit', 'zh-CN');
      expect(result).toBe('💳 负债账户');
    });

    it('should categorize Equity accounts correctly', () => {
      const result = (command as any).getAccountType('Equity:Opening', 'zh-CN');
      expect(result).toBe('🏦 权益账户');
    });

    it('should categorize Income accounts correctly', () => {
      const result = (command as any).getAccountType('Income:Salary', 'zh-CN');
      expect(result).toBe('📈 收入账户');
    });

    it('should categorize Expenses accounts correctly', () => {
      const result = (command as any).getAccountType('Expenses:Food', 'zh-CN');
      expect(result).toBe('💸 支出账户');
    });

    it('should categorize unknown accounts correctly', () => {
      const result = (command as any).getAccountType('Unknown:Account', 'zh-CN');
      expect(result).toBe('❓ 其他账户');
    });
  });
});
