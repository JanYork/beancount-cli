/**
 * 简单覆盖率测试
 * 专注于提升函数覆盖率，避免复杂的类型错误
 */

import { Result } from '../core/shared/result';
import { CommandResult } from '../types';

// 测试Result类的所有方法
describe('Result Coverage Tests', () => {
  describe('Result.success', () => {
    it('应该创建成功结果', () => {
      const result = Result.success('test');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('test');
    });

    it('应该处理复杂对象', () => {
      const data = { id: 1, name: 'test' };
      const result = Result.success(data);
      expect(result.value).toEqual(data);
    });
  });

  describe('Result.failure', () => {
    it('应该创建失败结果', () => {
      const result = Result.failure('error message');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('error message');
    });
  });

  describe('Result.map', () => {
    it('应该映射成功值', () => {
      const result = Result.success(5);
      const mapped = result.map((x: number) => x * 2);
      expect(mapped.value).toBe(10);
    });

    it('应该保持失败状态', () => {
      const result = Result.failure('error');
      const mapped = result.map((x: any) => x * 2);
      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe('error');
    });
  });

  describe('Result.mapError', () => {
    it('应该映射错误信息', () => {
      const result = Result.failure('original error');
      const mapped = result.mapError(err => `Modified: ${err}`);
      expect(mapped.error).toBe('Modified: original error');
    });

    it('应该保持成功状态', () => {
      const result = Result.success('data');
      const mapped = result.mapError(err => `Modified: ${err}`);
      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe('data');
    });
  });

  describe('Result.bind', () => {
    it('应该绑定成功结果', () => {
      const result = Result.success(5);
      const bound = result.bind((x: number) => Result.success(x * 2));
      expect(bound.value).toBe(10);
    });

    it('应该绑定失败结果', () => {
      const result = Result.failure('error');
      const bound = result.bind((x: any) => Result.success(x * 2));
      expect(bound.isFailure).toBe(true);
    });
  });

  describe('Result.getOrElse', () => {
    it('应该返回成功值', () => {
      const result = Result.success('success');
      const value = result.getOrElse('default');
      expect(value).toBe('success');
    });

    it('应该返回默认值', () => {
      const result = Result.failure('error');
      const value = result.getOrElse('default');
      expect(value).toBe('default');
    });
  });

  describe('Result.getOrThrow', () => {
    it('应该返回成功值', () => {
      const result = Result.success('success');
      const value = result.getOrThrow();
      expect(value).toBe('success');
    });

    it('应该抛出错误', () => {
      const result = Result.failure('error');
      expect(() => result.getOrThrow()).toThrow('error');
    });

    it('应该抛出自定义错误', () => {
      const result = Result.failure('error');
      expect(() => result.getOrThrow('custom error')).toThrow('custom error');
    });
  });

  describe('Result.match', () => {
    it('应该匹配成功情况', () => {
      const result = Result.success('success');
      const matched = result.match(
        value => `Success: ${value}`,
        error => `Error: ${error}`
      );
      expect(matched).toBe('Success: success');
    });

    it('应该匹配失败情况', () => {
      const result = Result.failure('error');
      const matched = result.match(
        value => `Success: ${value}`,
        error => `Error: ${error}`
      );
      expect(matched).toBe('Error: error');
    });
  });

  describe('Result.toString', () => {
    it('应该格式化成功结果', () => {
      const result = Result.success('test');
      const str = result.toString();
      expect(str).toContain('Success');
      expect(str).toContain('test');
    });

    it('应该格式化失败结果', () => {
      const result = Result.failure('error');
      const str = result.toString();
      expect(str).toContain('Failure');
      expect(str).toContain('error');
    });
  });

  describe('Result错误处理', () => {
    it('应该正确处理构造函数错误', () => {
      expect(() => new (Result as any)(true, 'value', 'error')).toThrow('成功结果不能包含错误信息');
      expect(() => new (Result as any)(false, 'value')).toThrow('失败结果必须包含错误信息');
    });

    it('应该正确处理value访问错误', () => {
      const result = Result.failure('error');
      expect(() => result.value).toThrow('无法获取失败结果的值');
    });

    it('应该正确处理error访问错误', () => {
      const result = Result.success('value');
      expect(() => result.error).toThrow('成功结果没有错误信息');
    });
  });
});

// 测试CommandResult类型
describe('CommandResult Coverage Tests', () => {
  it('应该创建成功的CommandResult', () => {
    const result: CommandResult = {
      success: true,
      message: '操作成功',
      data: { id: 1, name: 'test' }
    };
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('操作成功');
    expect(result.data).toEqual({ id: 1, name: 'test' });
  });

  it('应该创建失败的CommandResult', () => {
    const result: CommandResult = {
      success: false,
      message: '操作失败'
    };
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('操作失败');
  });

  it('应该处理可选的data和error字段', () => {
    const successResult: CommandResult = {
      success: true,
      message: '成功'
    };
    
    const failureResult: CommandResult = {
      success: false,
      message: '失败'
    };
    
    expect(successResult.success).toBe(true);
    expect(failureResult.success).toBe(false);
  });
}); 