/**
 * 错误处理服务
 * 提供统一的错误处理和日志记录
 * 
 * @author JanYork
 */

import { Result } from './result';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONFIGURATION = 'CONFIGURATION',
  NETWORK = 'NETWORK',
  FILE_SYSTEM = 'FILE_SYSTEM',
  PARSING = 'PARSING',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 应用错误类
 * 封装应用中的各种错误
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code: string = 'UNKNOWN_ERROR',
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }

  /**
   * 创建验证错误
   */
  static validation(message: string, details?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.VALIDATION, 'VALIDATION_ERROR', details);
  }

  /**
   * 创建未找到错误
   */
  static notFound(resource: string, details?: Record<string, any>): AppError {
    return new AppError(
      `${resource} 未找到`,
      ErrorType.NOT_FOUND,
      'NOT_FOUND_ERROR',
      details
    );
  }

  /**
   * 创建权限错误
   */
  static permissionDenied(action: string, details?: Record<string, any>): AppError {
    return new AppError(
      `没有权限执行操作: ${action}`,
      ErrorType.PERMISSION_DENIED,
      'PERMISSION_DENIED_ERROR',
      details
    );
  }

  /**
   * 创建配置错误
   */
  static configuration(message: string, details?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.CONFIGURATION, 'CONFIGURATION_ERROR', details);
  }

  /**
   * 创建文件系统错误
   */
  static fileSystem(operation: string, path: string, details?: Record<string, any>): AppError {
    return new AppError(
      `文件系统操作失败: ${operation} ${path}`,
      ErrorType.FILE_SYSTEM,
      'FILE_SYSTEM_ERROR',
      details
    );
  }

  /**
   * 创建解析错误
   */
  static parsing(message: string, details?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.PARSING, 'PARSING_ERROR', details);
  }

  /**
   * 创建业务逻辑错误
   */
  static businessLogic(message: string, details?: Record<string, any>): AppError {
    return new AppError(message, ErrorType.BUSINESS_LOGIC, 'BUSINESS_LOGIC_ERROR', details);
  }

  /**
   * 转换为Result对象
   */
  toResult<T>(): Result<T> {
    return Result.failure<T>(this.message);
  }

  /**
   * 获取错误摘要
   */
  getSummary(): string {
    return `[${this.type}] ${this.message}`;
  }

  /**
   * 获取详细错误信息
   */
  getDetails(): Record<string, any> {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
    };
  }
}

/**
 * 错误处理服务类
 * 提供统一的错误处理功能
 */
export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @returns 处理结果
   */
  handleError(error: unknown): Result<void> {
    try {
      if (error instanceof AppError) {
        return this.handleAppError(error);
      } else if (error instanceof Error) {
        return this.handleStandardError(error);
      } else {
        return this.handleUnknownError(error);
      }
    } catch (handlingError) {
      // 如果错误处理本身出错，记录并返回通用错误
      console.error('错误处理失败:', handlingError);
      return Result.failure('内部错误处理失败');
    }
  }

  /**
   * 处理应用错误
   */
  private handleAppError(error: AppError): Result<void> {
    // 记录错误
    this.logError(error);

    // 根据错误类型返回相应的结果
    switch (error.type) {
      case ErrorType.VALIDATION:
        return Result.failure(`验证失败: ${error.message}`);
      case ErrorType.NOT_FOUND:
        return Result.failure(`资源未找到: ${error.message}`);
      case ErrorType.PERMISSION_DENIED:
        return Result.failure(`权限不足: ${error.message}`);
      case ErrorType.CONFIGURATION:
        return Result.failure(`配置错误: ${error.message}`);
      case ErrorType.FILE_SYSTEM:
        return Result.failure(`文件系统错误: ${error.message}`);
      case ErrorType.PARSING:
        return Result.failure(`解析错误: ${error.message}`);
      case ErrorType.BUSINESS_LOGIC:
        return Result.failure(`业务逻辑错误: ${error.message}`);
      default:
        return Result.failure(`未知错误: ${error.message}`);
    }
  }

  /**
   * 处理标准错误
   */
  private handleStandardError(error: Error): Result<void> {
    this.logError(error);
    return Result.failure(error.message);
  }

  /**
   * 处理未知错误
   */
  private handleUnknownError(error: unknown): Result<void> {
    const errorMessage = typeof error === 'string' ? error : '未知错误';
    this.logError(new Error(errorMessage));
    return Result.failure(errorMessage);
  }

  /**
   * 记录错误
   */
  private logError(error: Error | AppError): void {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (error instanceof AppError) {
      Object.assign(errorInfo, error.getDetails());
    }

    // 这里可以集成日志系统
    console.error('错误详情:', JSON.stringify(errorInfo, null, 2));
  }

  /**
   * 包装异步操作
   * @param operation 异步操作
   * @returns 包装后的结果
   */
  async wrapAsync<T>(operation: () => Promise<T>): Promise<Result<T>> {
    try {
      const result = await operation();
      return Result.success(result);
    } catch (error) {
      const handledError = this.handleError(error);
      return Result.failure(handledError.error);
    }
  }

  /**
   * 包装同步操作
   * @param operation 同步操作
   * @returns 包装后的结果
   */
  wrapSync<T>(operation: () => T): Result<T> {
    try {
      const result = operation();
      return Result.success(result);
    } catch (error) {
      const handledError = this.handleError(error);
      return Result.failure(handledError.error);
    }
  }
}

/**
 * 便捷函数
 */
export const handleError = (error: unknown): Result<void> => {
  return ErrorHandler.getInstance().handleError(error);
};

export const wrapAsync = <T>(operation: () => Promise<T>): Promise<Result<T>> => {
  return ErrorHandler.getInstance().wrapAsync(operation);
};

export const wrapSync = <T>(operation: () => T): Result<T> => {
  return ErrorHandler.getInstance().wrapSync(operation);
}; 