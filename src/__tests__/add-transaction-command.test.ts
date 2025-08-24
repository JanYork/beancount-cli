/**
 * AddTransactionCommand 测试
 */

import { AddTransactionCommand } from '../commands/add-transaction-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { InteractiveCommandHandler } from '../presentation/cli/interactive-command-handler';

// Mock dependencies
jest.mock('../engine/beancount-engine');
jest.mock('../presentation/cli/interactive-command-handler');

describe('AddTransactionCommand', () => {
  let command: AddTransactionCommand;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    mockEngine = {
      addTransaction: jest.fn(),
      getTransactions: jest.fn(),
      getAccounts: jest.fn(),
      deleteTransaction: jest.fn(),
      saveTransactions: jest.fn()
    } as any;

    command = new AddTransactionCommand(mockEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('应该成功添加交易记录', async () => {
      const params = {
        date: '2024-01-15',
        narration: '午餐',
        amount: '25.50',
        accounts: ['Expenses:Food', 'Assets:Cash']
      };

      const result = await command.execute(params);

      expect(result.success).toBe(true);
      expect(result.message).toBe('✅ 交易记录添加成功');
      expect(result.data).toBeDefined();
      expect(mockEngine.addTransaction).toHaveBeenCalledWith({
        date: new Date('2024-01-15'),
        narration: '午餐',
        postings: [
          {
            account: 'Expenses:Food',
            units: {
              number: 25.50,
              currency: 'CNY'
            }
          },
          {
            account: 'Assets:Cash',
            units: {
              number: -25.50,
              currency: 'CNY'
            }
          }
        ],
        tags: [],
        links: []
      });
    });

    it('应该处理交互式模式', async () => {
      const mockInteractiveParams = {
        date: '2024-01-15',
        narration: '午餐',
        amount: '25.50',
        accounts: ['Expenses:Food', 'Assets:Cash']
      };

      (InteractiveCommandHandler.handleAddTransaction as jest.Mock).mockResolvedValue(mockInteractiveParams);

      const result = await command.execute({ interactive: true });

      expect(InteractiveCommandHandler.handleAddTransaction).toHaveBeenCalled();
      expect(mockEngine.addTransaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('应该处理空参数时使用交互式模式', async () => {
      const mockInteractiveParams = {
        date: '2024-01-15',
        narration: '午餐',
        amount: '25.50',
        accounts: ['Expenses:Food', 'Assets:Cash']
      };

      (InteractiveCommandHandler.handleAddTransaction as jest.Mock).mockResolvedValue(mockInteractiveParams);

      const result = await command.execute({});

      expect(InteractiveCommandHandler.handleAddTransaction).toHaveBeenCalled();
      expect(mockEngine.addTransaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('应该验证必需参数', async () => {
      const params = {
        date: '2024-01-15',
        narration: '午餐'
        // 缺少 amount 和 accounts
      };

      const result = await command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少必需参数');
      expect(mockEngine.addTransaction).not.toHaveBeenCalled();
    });

    it('应该验证账户数量', async () => {
      const params = {
        date: '2024-01-15',
        narration: '午餐',
        amount: '25.50',
        accounts: ['Expenses:Food'] // 只有一个账户
      };

      const result = await command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('缺少必需参数');
      expect(mockEngine.addTransaction).not.toHaveBeenCalled();
    });

    it('应该处理引擎错误', async () => {
      const params = {
        date: '2024-01-15',
        narration: '午餐',
        amount: '25.50',
        accounts: ['Expenses:Food', 'Assets:Cash']
      };

      mockEngine.addTransaction.mockImplementation(() => {
        throw new Error('引擎错误');
      });

      const result = await command.execute(params);

      expect(result.success).toBe(false);
      expect(result.message).toContain('添加交易记录失败');
    });

    it('应该处理交互式模式错误', async () => {
      (InteractiveCommandHandler.handleAddTransaction as jest.Mock).mockRejectedValue(new Error('交互式错误'));

      const result = await command.execute({ interactive: true });

      expect(result.success).toBe(false);
      expect(result.message).toContain('交互式添加交易记录失败');
    });

    it('应该处理无效日期', async () => {
      const params = {
        date: 'invalid-date',
        narration: '午餐',
        amount: '25.50',
        accounts: ['Expenses:Food', 'Assets:Cash']
      };

      const result = await command.execute(params);

      expect(result.success).toBe(true); // 日期解析不会抛出错误，会创建Invalid Date
      expect(mockEngine.addTransaction).toHaveBeenCalled();
    });

    it('应该处理无效金额', async () => {
      const params = {
        date: '2024-01-15',
        narration: '午餐',
        amount: 'invalid-amount',
        accounts: ['Expenses:Food', 'Assets:Cash']
      };

      const result = await command.execute(params);

      expect(result.success).toBe(true); // parseFloat会返回NaN，但不会抛出错误
      expect(mockEngine.addTransaction).toHaveBeenCalled();
    });
  });

  describe('getHelp', () => {
    it('应该返回帮助信息', () => {
      const help = command.getHelp();

      expect(help).toContain('📝 添加交易记录');
      expect(help).toContain('用法: add_transaction');
      expect(help).toContain('date: 交易日期');
      expect(help).toContain('narration: 交易描述');
      expect(help).toContain('amount: 交易金额');
      expect(help).toContain('accounts: 账户列表');
    });
  });

  describe('validateParams', () => {
    it('应该验证参数', () => {
      const params = {
        date: '2024-01-15',
        narration: '午餐',
        amount: '25.50',
        accounts: ['Expenses:Food', 'Assets:Cash']
      };

      const result = command['validateParams'](params);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
}); 