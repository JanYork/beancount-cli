/**
 * Result类
 * 实现统一的错误处理模式，提供类型安全的成功/失败结果
 * 
 * @author JanYork
 */

/**
 * Result类
 * 封装操作结果，提供类型安全的成功/失败处理
 */
export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: string
  ) {
    if (_isSuccess && _error) {
      throw new Error('成功结果不能包含错误信息');
    }
    if (!_isSuccess && !_error) {
      throw new Error('失败结果必须包含错误信息');
    }
  }

  /**
   * 创建成功结果
   * @param value 成功值
   * @returns 成功结果
   */
  static success<T>(value: T): Result<T> {
    return new Result<T>(true, value, undefined);
  }

  /**
   * 创建失败结果
   * @param error 错误信息
   * @returns 失败结果
   */
  static failure<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  /**
   * 检查是否为成功结果
   */
  get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * 检查是否为失败结果
   */
  get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * 获取成功值
   * @throws 如果结果失败则抛出错误
   */
  get value(): T {
    if (this.isFailure) {
      throw new Error(`无法获取失败结果的值: ${this._error}`);
    }
    return this._value!;
  }

  /**
   * 获取错误信息
   * @throws 如果结果成功则抛出错误
   */
  get error(): string {
    if (this.isSuccess) {
      throw new Error('成功结果没有错误信息');
    }
    return this._error!;
  }

  /**
   * 映射成功值
   * @param fn 映射函数
   * @returns 新的Result
   */
  map<U>(fn: (value: T) => U): Result<U> {
    if (this.isSuccess) {
      return Result.success(fn(this._value!));
    }
    return Result.failure<U>(this._error!);
  }

  /**
   * 映射错误信息
   * @param fn 错误映射函数
   * @returns 新的Result
   */
  mapError(fn: (error: string) => string): Result<T> {
    if (this.isFailure) {
      return Result.failure(fn(this._error!));
    }
    return Result.success(this._value!);
  }

  /**
   * 绑定操作
   * @param fn 绑定函数
   * @returns 新的Result
   */
  bind<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isSuccess) {
      return fn(this._value!);
    }
    return Result.failure<U>(this._error!);
  }

  /**
   * 处理成功和失败情况
   * @param onSuccess 成功处理函数
   * @param onFailure 失败处理函数
   * @returns 处理结果
   */
  match<U>(
    onSuccess: (value: T) => U,
    onFailure: (error: string) => U
  ): U {
    if (this.isSuccess) {
      return onSuccess(this._value!);
    }
    return onFailure(this._error!);
  }

  /**
   * 获取值或默认值
   * @param defaultValue 默认值
   * @returns 值或默认值
   */
  getOrElse(defaultValue: T): T {
    return this.isSuccess ? this._value! : defaultValue;
  }

  /**
   * 获取值或抛出错误
   * @param errorMessage 自定义错误信息
   * @returns 值
   * @throws 如果结果失败则抛出错误
   */
  getOrThrow(errorMessage?: string): T {
    if (this.isSuccess) {
      return this._value!;
    }
    throw new Error(errorMessage || this._error);
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    if (this.isSuccess) {
      return `Success(${JSON.stringify(this._value)})`;
    }
    return `Failure(${this._error})`;
  }
} 