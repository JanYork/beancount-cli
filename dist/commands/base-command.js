"use strict";
/**
 * 命令基类
 *
 * 作者: JanYork
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
class BaseCommand {
    /**
     * 验证参数
     *
     * @param params 参数
     * @returns 验证结果
     */
    validateParams(_params) {
        const errors = [];
        // 子类可以重写此方法进行具体验证
        return { valid: errors.length === 0, errors };
    }
    /**
     * 创建成功结果
     *
     * @param message 消息
     * @param data 数据
     * @returns 成功结果
     */
    createSuccessResult(message, data) {
        return {
            success: true,
            message,
            data
        };
    }
    /**
     * 创建失败结果
     *
     * @param message 消息
     * @param data 数据
     * @returns 失败结果
     */
    createErrorResult(message, data) {
        return {
            success: false,
            message,
            data
        };
    }
}
exports.BaseCommand = BaseCommand;
//# sourceMappingURL=base-command.js.map