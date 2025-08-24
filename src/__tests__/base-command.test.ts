/**
 * BaseCommand 测试
 */

import { BaseCommand } from '../commands/base-command';
import { BeancountEngine } from '../engine/beancount-engine';
import { CommandResult } from '../types';

// 创建一个测试用的命令类
class TestCommand extends BaseCommand {
  constructor(engine?: BeancountEngine) {
    super(engine);
  }

  async execute(params: Record<string, any>): Promise<CommandResult> {
    // 测试参数验证
    const validation = this.validateParams(params);
    if (!validation.valid) {
      return this.createErrorResult(`参数验证失败: ${validation.errors.join(', ')}`);
    }

    // 测试成功情况
    if (params['success'] === true) {
      return this.createSuccessResult('测试成功', { test: 'data' });
    }

    // 测试错误情况
    if (params['error'] === true) {
      return this.createErrorResult('测试错误', { error: 'details' });
    }

    // 默认返回成功
    return this.createSuccessResult('默认成功');
  }

  getHelp(): string {
    return '测试命令帮助信息';
  }

  // 重写validateParams方法进行测试
  protected override validateParams(params: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params['required'] === false) {
      errors.push('必需参数缺失');
    }

    if (params['invalid']) {
      errors.push('参数无效');
    }

    return { valid: errors.length === 0, errors };
  }
}

describe('BaseCommand', () => {
  let command: TestCommand;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    mockEngine = {
      addTransaction: jest.fn(),
      getTransactions: jest.fn(),
      getAccounts: jest.fn(),
      deleteTransaction: jest.fn(),
      saveTransactions: jest.fn()
    } as any;

    command = new TestCommand(mockEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('应该正确创建实例', () => {
      expect(command).toBeDefined();
      expect(command).toBeInstanceOf(BaseCommand);
    });

    it('应该接受可选的引擎参数', () => {
      const commandWithoutEngine = new TestCommand();
      expect(commandWithoutEngine).toBeDefined();
    });
  });

  describe('execute', () => {
    it('应该成功执行命令', async () => {
      const result = await command.execute({ success: true });

      expect(result.success).toBe(true);
      expect(result.message).toBe('测试成功');
      expect(result.data).toEqual({ test: 'data' });
    });

    it('应该处理错误情况', async () => {
      const result = await command.execute({ error: true });

      expect(result.success).toBe(false);
      expect(result.message).toBe('测试错误');
      expect(result.data).toEqual({ error: 'details' });
    });

    it('应该返回默认成功结果', async () => {
      const result = await command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toBe('默认成功');
    });

    it('应该处理参数验证失败', async () => {
      const result = await command.execute({ required: false });

      expect(result.success).toBe(false);
      expect(result.message).toContain('参数验证失败');
      expect(result.message).toContain('必需参数缺失');
    });

    it('应该处理多个验证错误', async () => {
      const result = await command.execute({ required: false, invalid: true });

      expect(result.success).toBe(false);
      expect(result.message).toContain('必需参数缺失');
      expect(result.message).toContain('参数无效');
    });
  });

  describe('validateParams', () => {
    it('应该验证有效参数', () => {
      const result = command['validateParams']({ required: true });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该检测无效参数', () => {
      const result = command['validateParams']({ invalid: true });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('参数无效');
    });

    it('应该检测缺失的必需参数', () => {
      const result = command['validateParams']({ required: false });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('必需参数缺失');
    });
  });

  describe('createSuccessResult', () => {
    it('应该创建成功结果', () => {
      const result = command['createSuccessResult']('成功消息', { data: 'test' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('成功消息');
      expect(result.data).toEqual({ data: 'test' });
    });

    it('应该创建不带数据的成功结果', () => {
      const result = command['createSuccessResult']('成功消息');

      expect(result.success).toBe(true);
      expect(result.message).toBe('成功消息');
      expect(result.data).toBeUndefined();
    });
  });

  describe('createErrorResult', () => {
    it('应该创建错误结果', () => {
      const result = command['createErrorResult']('错误消息', { error: 'details' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('错误消息');
      expect(result.data).toEqual({ error: 'details' });
    });

    it('应该创建不带数据的错误结果', () => {
      const result = command['createErrorResult']('错误消息');

      expect(result.success).toBe(false);
      expect(result.message).toBe('错误消息');
      expect(result.data).toBeUndefined();
    });
  });

  describe('getHelp', () => {
    it('应该返回帮助信息', () => {
      const help = command.getHelp();

      expect(help).toBe('测试命令帮助信息');
    });
  });

  describe('引擎访问', () => {
    it('应该能够访问引擎实例', () => {
      expect(command['engine']).toBe(mockEngine);
    });

    it('应该在没有引擎时返回undefined', () => {
      const commandWithoutEngine = new TestCommand();
      expect(commandWithoutEngine['engine']).toBeUndefined();
    });
  });
});
