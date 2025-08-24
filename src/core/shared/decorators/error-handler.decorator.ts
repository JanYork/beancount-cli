/**
 * 错误处理装饰器
 * 提供统一的错误处理机制，自动包装方法调用
 * 
 * @author JanYork
 */

import { Result } from '../result';
import { AppError } from '../error-handler';

/**
 * 错误处理装饰器
 * 自动捕获方法执行中的错误并转换为Result对象
 */
export function HandleErrors() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        
        // 如果方法返回Result对象，直接返回
        if (result instanceof Result) {
          return result;
        }
        
        // 否则包装为成功结果
        return Result.success(result);
      } catch (error) {
        // 处理不同类型的错误
        if (error instanceof AppError) {
          return error.toResult();
        } else if (error instanceof Error) {
          return Result.failure(error.message);
        } else {
          return Result.failure('未知错误');
        }
      }
    };

    return descriptor;
  };
}

/**
 * 验证装饰器
 * 在方法执行前进行参数验证
 */
export function Validate(validator: (args: any[]) => Result<void>) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 执行验证
      const validationResult = validator(args);
      if (validationResult.isFailure) {
        return validationResult;
      }

      // 执行原方法
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 日志装饰器
 * 记录方法调用的开始和结束
 */
export function LogMethod(level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const methodName = `${_target.constructor.name}.${_propertyKey}`;
      
      console.log(`[${level.toUpperCase()}] 开始执行: ${methodName}`);
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        console.log(`[${level.toUpperCase()}] 执行完成: ${methodName} (${duration}ms)`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[ERROR] 执行失败: ${methodName} (${duration}ms)`, error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 重试装饰器
 * 在方法失败时自动重试
 */
export function Retry(maxAttempts: number = 3, delay: number = 1000) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          
          if (attempt === maxAttempts) {
            throw lastError;
          }
          
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    };

    return descriptor;
  };
}

/**
 * 缓存装饰器
 * 缓存方法执行结果
 */
export function Cache(ttl: number = 60000) { // 默认1分钟
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { result: any; timestamp: number }>();

    descriptor.value = async function (...args: any[]) {
      const cacheKey = JSON.stringify(args);
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.result;
      }
      
      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, { result, timestamp: Date.now() });
      
      return result;
    };

    return descriptor;
  };
} 