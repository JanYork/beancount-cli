/**
 * 帮助命令测试
 *
 * 作者: JanYork
 */

import { HelpCommand } from '../commands/help-command';

describe('HelpCommand', () => {
  let command: HelpCommand;

  beforeEach(() => {
    command = new HelpCommand();
  });

  describe('execute', () => {
    it('should return help text without parameters', () => {
      const result = command.execute({});

      expect(result.success).toBe(true);
      expect(result.message).toContain('Beancount CLI 帮助信息');
      expect(result.message).toContain('可用命令:');
      expect(result.message).toContain('/add_transaction');
      expect(result.message).toContain('/list_transactions');
      expect(result.message).toContain('/show_balance');
      expect(result.message).toContain('/help');
      expect(result.message).toContain('/quit');
    });

    it('should return help text with any parameters', () => {
      const result = command.execute({
        command: 'add_transaction',
        verbose: true,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Beancount CLI 帮助信息');
    });

    it('should include all command descriptions', () => {
      const result = command.execute({});

      expect(result.message).toContain('添加交易记录');
      expect(result.message).toContain('列出交易记录');
      expect(result.message).toContain('显示账户余额');
      expect(result.message).toContain('显示净资产');
      expect(result.message).toContain('列出所有账户');
      expect(result.message).toContain('验证文件');
      expect(result.message).toContain('显示此帮助信息');
      expect(result.message).toContain('重新加载文件');
      expect(result.message).toContain('退出程序');
    });

    it('should include usage examples', () => {
      const result = command.execute({});

      expect(result.message).toContain('用法:');
      expect(result.message).toContain('/add_transaction date=2024-01-01 narration="午餐"');
    });

    it('should include tips section', () => {
      const result = command.execute({});

      expect(result.message).toContain('📝 提示:');
      expect(result.message).toContain('所有命令都支持 /xxx 格式');
      expect(result.message).toContain('日期格式: YYYY-MM-DD');
      expect(result.message).toContain('金额可以是正数或负数');
      expect(result.message).toContain('使用引号包围包含空格的文本');
    });
  });

  describe('getHelp', () => {
    it('should return help text for help command', () => {
      const help = command.getHelp();

      expect(help).toContain('❓ 帮助命令');
      expect(help).toContain('用法:');
      expect(help).toContain('参数:');
      expect(help).toContain('示例:');
    });

    it('should include parameter description', () => {
      const help = command.getHelp();

      expect(help).toContain('command: 特定命令名称 (可选)');
    });

    it('should include usage examples', () => {
      const help = command.getHelp();

      expect(help).toContain('/help');
      expect(help).toContain('/help command="add_transaction"');
    });
  });
});
