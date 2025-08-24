/**
 * Tab补全功能演示
 * 展示真正的Tab键补全功能
 * 
 * @author JanYork
 */

import { TabCompleter } from '../presentation/cli/tab-completer';
import { CLIRenderer } from '../presentation/cli/cli-renderer';

/**
 * Tab补全演示类
 */
export class TabCompletionDemo {
  private tabCompleter: TabCompleter;

  constructor() {
    this.tabCompleter = new TabCompleter();
  }

  /**
   * 运行演示
   */
  async run(): Promise<void> {
    console.clear();
    CLIRenderer.showBanner('Tab补全功能演示', '体验真正的Tab键补全');
    console.log();

    console.log('🎯 功能特点:');
    console.log('  • 真正的Tab键补全（不是命令猜测）');
    console.log('  • 支持命令历史记录（Ctrl+↑/↓）');
    console.log('  • 智能命令建议');
    console.log('  • 自动添加/前缀');
    console.log();

    console.log('📝 使用方法:');
    console.log('  1. 输入部分命令，按Tab键补全');
    console.log('  2. 如果只有一个匹配项，自动补全');
    console.log('  3. 如果有多个匹配项，显示所有选项');
    console.log('  4. 使用Ctrl+↑/↓浏览历史记录');
    console.log('  5. 输入 "quit" 退出演示');
    console.log();

    console.log('💡 示例命令:');
    console.log('  • /he<Tab> → /help');
    console.log('  • /add<Tab> → /add_transaction');
    console.log('  • /list<Tab> → 显示所有list_开头的命令');
    console.log('  • he<Tab> → /help（自动添加/前缀）');
    console.log();

    await this.startInteractiveDemo();
  }

  /**
   * 开始交互式演示
   */
  private async startInteractiveDemo(): Promise<void> {
    let running = true;

    while (running) {
      try {
        const input = await this.tabCompleter.showPrompt('💻 请输入命令 (Tab补全): ');
        
        if (!input.trim()) {
          continue;
        }

        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
          running = false;
          console.log('👋 演示结束，感谢使用！');
          break;
        }

        if (input.toLowerCase() === 'history') {
          this.tabCompleter.showHistory();
          continue;
        }

        if (input.toLowerCase() === 'clear') {
          this.tabCompleter.clearHistory();
          console.log('🗑️  历史记录已清空');
          continue;
        }

        // 模拟命令执行
        console.log(`✅ 执行命令: ${input}`);
        console.log(`📊 命令历史记录数量: ${this.tabCompleter.getHistory().length}`);
        console.log();

      } catch (error) {
        if (error instanceof Error && error.message.includes('SIGINT')) {
          console.log('\n👋 演示被中断，感谢使用！');
          break;
        }
        console.error('❌ 发生错误:', error);
      }
    }

    this.tabCompleter.close();
  }

  /**
   * 显示帮助信息
   */
  static showHelp(): void {
    console.log('Tab补全演示帮助:');
    console.log('  quit/exit  - 退出演示');
    console.log('  history    - 显示命令历史');
    console.log('  clear      - 清空历史记录');
    console.log('  <Tab>      - 补全命令');
    console.log('  Ctrl+↑/↓   - 浏览历史记录');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const demo = new TabCompletionDemo();
  demo.run().catch(console.error);
} 