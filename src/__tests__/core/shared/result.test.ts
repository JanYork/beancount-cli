/**
 * Result类测试
 *
 * 作者: JanYork
 */

import { Result } from '../../../core/shared/result';

describe('Result', () => {
  describe('success', () => {
    it('should create a successful result', () => {
      const result = Result.success('test value');
      
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe('test value');
    });

    it('should create a successful result with object', () => {
      const data = { id: 1, name: 'test' };
      const result = Result.success(data);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(data);
    });

    it('should create a successful result with null', () => {
      const result = Result.success(null);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('failure', () => {
    it('should create a failure result', () => {
      const result = Result.failure('error message');
      
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('error message');
    });
  });

  describe('constructor validation', () => {
    it('should throw error when success result contains error', () => {
      expect(() => {
        new (Result as any)(true, 'value', 'error');
      }).toThrow('成功结果不能包含错误信息');
    });

    it('should throw error when failure result has no error', () => {
      expect(() => {
        new (Result as any)(false, 'value', undefined);
      }).toThrow('失败结果必须包含错误信息');
    });
  });

  describe('value getter', () => {
    it('should return value for success result', () => {
      const result = Result.success('test');
      expect(result.value).toBe('test');
    });

    it('should throw error when accessing value of failure result', () => {
      const result = Result.failure('error');
      expect(() => result.value).toThrow('无法获取失败结果的值: error');
    });
  });

  describe('error getter', () => {
    it('should return error for failure result', () => {
      const result = Result.failure('error message');
      expect(result.error).toBe('error message');
    });

    it('should throw error when accessing error of success result', () => {
      const result = Result.success('value');
      expect(() => result.error).toThrow('成功结果没有错误信息');
    });
  });

  describe('map', () => {
    it('should map success value', () => {
      const result = Result.success(5);
      const mapped = result.map((x: unknown) => (x as number) * 2);
      
      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe(10);
    });

    it('should preserve failure in map', () => {
      const result = Result.failure('error');
      const mapped = result.map((x: unknown) => (x as number) * 2);
      
      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe('error');
    });

    it('should map to different type', () => {
      const result = Result.success(5);
      const mapped = result.map((x: unknown) => `Number: ${x as number}`);
      
      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe('Number: 5');
    });
  });

  describe('mapError', () => {
    it('should map error message', () => {
      const result = Result.failure('original error');
      const mapped = result.mapError(error => `Modified: ${error}`);
      
      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe('Modified: original error');
    });

    it('should preserve success in mapError', () => {
      const result = Result.success('value');
      const mapped = result.mapError(error => `Modified: ${error}`);
      
      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe('value');
    });
  });

  describe('bind', () => {
    it('should bind success to another result', () => {
      const result = Result.success(5);
      const bound = result.bind((x: unknown) => Result.success((x as number) * 2));
      
      expect(bound.isSuccess).toBe(true);
      expect(bound.value).toBe(10);
    });

    it('should bind success to failure', () => {
      const result = Result.success(5);
      const bound = result.bind(() => Result.failure('bound error'));
      
      expect(bound.isFailure).toBe(true);
      expect(bound.error).toBe('bound error');
    });

    it('should preserve failure in bind', () => {
      const result = Result.failure('original error');
      const bound = result.bind((x: unknown) => Result.success((x as number) * 2));
      
      expect(bound.isFailure).toBe(true);
      expect(bound.error).toBe('original error');
    });
  });

  describe('match', () => {
    it('should match success case', () => {
      const result = Result.success(5);
      const matched = result.match(
        value => `Success: ${value}`,
        error => `Error: ${error}`
      );
      
      expect(matched).toBe('Success: 5');
    });

    it('should match failure case', () => {
      const result = Result.failure('error message');
      const matched = result.match(
        value => `Success: ${value}`,
        error => `Error: ${error}`
      );
      
      expect(matched).toBe('Error: error message');
    });

    it('should match with different return types', () => {
      const result = Result.success(5);
      const matched = result.match(
        value => value * 2,
        _error => -1
      );
      
      expect(matched).toBe(10);
    });
  });

  describe('getOrElse', () => {
    it('should return value for success', () => {
      const result = Result.success('actual value');
      const value = result.getOrElse('default value');
      
      expect(value).toBe('actual value');
    });

    it('should return default for failure', () => {
      const result = Result.failure('error');
      const value = result.getOrElse('default value');
      
      expect(value).toBe('default value');
    });

    it('should return default null for failure', () => {
      const result = Result.failure('error');
      const value = result.getOrElse(null);
      
      expect(value).toBeNull();
    });
  });

  describe('getOrThrow', () => {
    it('should return value for success', () => {
      const result = Result.success('actual value');
      const value = result.getOrThrow();
      
      expect(value).toBe('actual value');
    });

    it('should throw original error for failure', () => {
      const result = Result.failure('original error');
      
      expect(() => result.getOrThrow()).toThrow('original error');
    });

    it('should throw custom error for failure', () => {
      const result = Result.failure('original error');
      
      expect(() => result.getOrThrow('custom error')).toThrow('custom error');
    });
  });

  describe('toString', () => {
    it('should stringify success result', () => {
      const result = Result.success('test value');
      const str = result.toString();
      
      expect(str).toBe('Success("test value")');
    });

    it('should stringify success result with object', () => {
      const result = Result.success({ id: 1, name: 'test' });
      const str = result.toString();
      
      expect(str).toBe('Success({"id":1,"name":"test"})');
    });

    it('should stringify failure result', () => {
      const result = Result.failure('error message');
      const str = result.toString();
      
      expect(str).toBe('Failure(error message)');
    });
  });

  describe('complex scenarios', () => {
    it('should chain multiple operations', () => {
      const result = Result.success(5)
        .map((x: unknown) => (x as number) * 2)
        .bind((x: unknown) => (x as number) > 10 ? Result.failure('too large') : Result.success(x as number))
        .map((x: unknown) => `Result: ${x as number}`);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('Result: 10');
    });

    it('should handle error in chain', () => {
      const result = Result.success(15)
        .map((x: unknown) => (x as number) * 2)
        .bind((x: unknown) => (x as number) > 10 ? Result.failure('too large') : Result.success(x as number))
        .map((x: unknown) => `Result: ${x as number}`);
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('too large');
    });

    it('should use match for complex logic', () => {
      const result = Result.success(5);
      const processed = result.match(
        value => {
          if (value > 10) return 'large';
          if (value > 5) return 'medium';
          return 'small';
        },
        error => `error: ${error}`
      );
      
      expect(processed).toBe('small');
    });
  });
});