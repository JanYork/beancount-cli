/**
 * 基础命令类测试
 *
 * 作者: JanYork
 */

import { BaseCommand } from '../commands/base-command';
import { CommandResult } from '../types';

// 创建测试用的具体命令类
class TestCommand extends BaseCommand {
  execute(params: Record<string, any>): CommandResult {
    return this.createSuccessResult('Test executed successfully', params);
  }

  getHelp(): string {
    return 'Test command help';
  }

  // 暴露受保护的方法用于测试
  testValidateParams(params: Record<string, any>) {
    return this.validateParams(params);
  }

  testCreateSuccessResult(message: string, data?: any) {
    return this.createSuccessResult(message, data);
  }

  testCreateErrorResult(message: string, data?: any) {
    return this.createErrorResult(message, data);
  }
}

describe('BaseCommand', () => {
  let testCommand: TestCommand;

  beforeEach(() => {
    testCommand = new TestCommand();
  });

  describe('validateParams', () => {
    it('should return valid result for empty params', () => {
      const result = testCommand.testValidateParams({});
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return valid result for any params', () => {
      const result = testCommand.testValidateParams({ key: 'value' });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('createSuccessResult', () => {
    it('should create success result with message only', () => {
      const result = testCommand.testCreateSuccessResult('Success message');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Success message');
      expect(result.data).toBeUndefined();
    });

    it('should create success result with message and data', () => {
      const data = { key: 'value' };
      const result = testCommand.testCreateSuccessResult('Success message', data);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Success message');
      expect(result.data).toEqual(data);
    });
  });

  describe('createErrorResult', () => {
    it('should create error result with message only', () => {
      const result = testCommand.testCreateErrorResult('Error message');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error message');
      expect(result.data).toBeUndefined();
    });

    it('should create error result with message and data', () => {
      const data = { errorCode: 500 };
      const result = testCommand.testCreateErrorResult('Error message', data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error message');
      expect(result.data).toEqual(data);
    });
  });

  describe('execute', () => {
    it('should execute command and return result', () => {
      const params = { test: 'value' };
      const result = testCommand.execute(params);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Test executed successfully');
      expect(result.data).toEqual(params);
    });
  });

  describe('getHelp', () => {
    it('should return help text', () => {
      const help = testCommand.getHelp();
      expect(help).toBe('Test command help');
    });
  });
});
