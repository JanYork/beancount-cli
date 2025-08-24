/**
 * 性能监控服务
 * 提供性能指标收集、分析和报告功能
 * 
 * @author JanYork
 */

import { Result } from '../../core/shared/result';

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

/**
 * 方法执行统计
 */
export interface MethodExecutionStats {
  methodName: string;
  className: string;
  totalCalls: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  errorCount: number;
  lastExecuted: Date;
}

/**
 * 性能监控服务类
 * 收集和分析应用性能指标
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private methodStats: Map<string, MethodExecutionStats> = new Map();
  private enabled: boolean = true;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
    };

    this.metrics.push(metric);
  }

  /**
   * 记录方法执行时间
   */
  recordMethodExecution(
    className: string,
    methodName: string,
    duration: number,
    success: boolean
  ): void {
    if (!this.enabled) return;

    const key = `${className}.${methodName}`;
    const existing = this.methodStats.get(key);

    if (existing) {
      existing.totalCalls++;
      existing.totalDuration += duration;
      existing.averageDuration = existing.totalDuration / existing.totalCalls;
      existing.minDuration = Math.min(existing.minDuration, duration);
      existing.maxDuration = Math.max(existing.maxDuration, duration);
      if (!success) existing.errorCount++;
      existing.lastExecuted = new Date();
    } else {
      this.methodStats.set(key, {
        methodName,
        className,
        totalCalls: 1,
        totalDuration: duration,
        averageDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        errorCount: success ? 0 : 1,
        lastExecuted: new Date(),
      });
    }
  }

  /**
   * 获取方法执行统计
   */
  getMethodStats(): MethodExecutionStats[] {
    return Array.from(this.methodStats.values());
  }

  /**
   * 获取指定方法的统计
   */
  getMethodStat(className: string, methodName: string): MethodExecutionStats | null {
    const key = `${className}.${methodName}`;
    return this.methodStats.get(key) || null;
  }

  /**
   * 获取性能指标
   */
  getMetrics(filter?: { name?: string; startTime?: Date; endTime?: Date }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filter?.name) {
      filtered = filtered.filter(m => m.name === filter.name);
    }

    if (filter?.startTime) {
      filtered = filtered.filter(m => m.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      filtered = filtered.filter(m => m.timestamp <= filter.endTime!);
    }

    return filtered;
  }

  /**
   * 生成性能报告
   */
  generateReport(): Result<{
    summary: {
      totalMetrics: number;
      totalMethodCalls: number;
      averageMethodDuration: number;
      slowestMethod: MethodExecutionStats | null;
      mostCalledMethod: MethodExecutionStats | null;
    };
    methodStats: MethodExecutionStats[];
    recentMetrics: PerformanceMetric[];
  }> {
    try {
      const methodStats = this.getMethodStats();
      const totalMethodCalls = methodStats.reduce((sum, stat) => sum + stat.totalCalls, 0);
      const totalDuration = methodStats.reduce((sum, stat) => sum + stat.totalDuration, 0);
      const averageMethodDuration = totalMethodCalls > 0 ? totalDuration / totalMethodCalls : 0;

      const slowestMethod = methodStats.length > 0 
        ? methodStats.reduce((slowest, current) => 
            current.averageDuration > slowest.averageDuration ? current : slowest
          )
        : null;

      const mostCalledMethod = methodStats.length > 0
        ? methodStats.reduce((most, current) => 
            current.totalCalls > most.totalCalls ? current : most
          )
        : null;

      const recentMetrics = this.metrics
        .slice(-100) // 最近100个指标
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return Result.success({
        summary: {
          totalMetrics: this.metrics.length,
          totalMethodCalls,
          averageMethodDuration,
          slowestMethod,
          mostCalledMethod,
        },
        methodStats,
        recentMetrics,
      });
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '生成性能报告失败');
    }
  }

  /**
   * 清理旧数据
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void { // 默认24小时
    const cutoffTime = new Date(Date.now() - maxAge);
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    // 清理方法统计中的旧数据
    for (const [key, stat] of this.methodStats.entries()) {
      if (stat.lastExecuted < cutoffTime) {
        this.methodStats.delete(key);
      }
    }
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 重置所有数据
   */
  reset(): void {
    this.metrics = [];
    this.methodStats.clear();
  }

  /**
   * 导出数据
   */
  exportData(): Result<{
    metrics: PerformanceMetric[];
    methodStats: MethodExecutionStats[];
  }> {
    try {
      return Result.success({
        metrics: [...this.metrics],
        methodStats: this.getMethodStats(),
      });
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : '导出数据失败');
    }
  }
}

/**
 * 性能监控装饰器
 * 自动记录方法执行性能
 */
export function MonitorPerformance() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const monitor = PerformanceMonitor.getInstance();

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        monitor.recordMethodExecution(
          target.constructor.name,
          propertyKey,
          duration,
          success
        );
      }
    };

    return descriptor;
  };
}

/**
 * 便捷函数
 */
export const recordMetric = (name: string, value: number, unit: string, tags?: Record<string, string>): void => {
  PerformanceMonitor.getInstance().recordMetric(name, value, unit, tags);
};

export const getPerformanceReport = (): Result<any> => {
  return PerformanceMonitor.getInstance().generateReport();
}; 