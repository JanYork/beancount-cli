/**
 * Tab补全模块
 * 提供真正的Tab键补全功能
 * 
 * @author JanYork
 */

import * as readline from 'readline';
import { CommandCompleter } from '../../utils/command-completer';
import { t } from '../../utils/i18n';

/**
 * Tab补全器类
 * 提供智能的命令补全功能
 */
export class TabCompleter {
  private rl: readline.Interface;
  private commandHistory: string[] = [];
  private currentHistoryIndex = -1;
  private originalLine = '';

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: this.completer.bind(this),
      terminal: true,
    });

    this.setupKeyBindings();
  }

  /**
   * 补全函数
   * 当用户按Tab键时调用
   */
  private completer(line: string): [string[], string] {
    const trimmedLine = line.trim();
    
    // 支持直接tab补全，不需要/前缀
    if (trimmedLine.length > 0) {
      const suggestions = CommandCompleter.getSuggestions(trimmedLine);
      
      if (suggestions.length === 0) {
        return [[], line];
      }
      
      // 如果只有一个建议，直接补全
      if (suggestions.length === 1) {
        const completedCommand = suggestions[0]?.command || '';
        return [[completedCommand], completedCommand];
      }
      
      // 如果有多个建议，显示所有选项
      const completions = suggestions.map(s => s.command);
      return [completions, line];
    }
    
    // 如果输入为空，显示常用命令
    const commonCommands = CommandCompleter.getCommonCommands();
    const completions = commonCommands.map(cmd => cmd.command);
    return [completions, line];
  }

  /**
   * 设置键盘绑定
   */
  private setupKeyBindings(): void {
    // 处理上下箭头键进行历史记录导航
    this.rl.on('line', (input) => {
      if (input.trim()) {
        this.addToHistory(input.trim());
      }
    });

    // 监听键盘事件
    process.stdin.on('keypress', (_str, key) => {
      if (key.name === 'up' && key.ctrl) {
        this.navigateHistory('up');
      } else if (key.name === 'down' && key.ctrl) {
        this.navigateHistory('down');
      } else if (key.name === 'tab') {
        // Tab键补全已经在completer中处理
        return;
      } else if (key.name === 'c' && key.ctrl) {
        // Ctrl+C 处理
        process.exit(0);
      }
    });
  }

  /**
   * 导航历史记录
   */
  private navigateHistory(direction: 'up' | 'down'): void {
    if (direction === 'up') {
      if (this.currentHistoryIndex < this.commandHistory.length - 1) {
        this.currentHistoryIndex++;
        this.rl.write(null, { ctrl: true, name: 'u' }); // 清除当前行
        const historyItem = this.commandHistory[this.currentHistoryIndex];
        if (historyItem) {
          this.rl.write(historyItem);
        }
      }
    } else {
      if (this.currentHistoryIndex > 0) {
        this.currentHistoryIndex--;
        this.rl.write(null, { ctrl: true, name: 'u' }); // 清除当前行
        const historyItem = this.commandHistory[this.currentHistoryIndex];
        if (historyItem) {
          this.rl.write(historyItem);
        }
      } else if (this.currentHistoryIndex === 0) {
        this.currentHistoryIndex = -1;
        this.rl.write(null, { ctrl: true, name: 'u' }); // 清除当前行
        this.rl.write(this.originalLine);
      }
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(command: string): void {
    // 避免重复添加相同的命令
    const index = this.commandHistory.indexOf(command);
    if (index > -1) {
      this.commandHistory.splice(index, 1);
    }
    
    this.commandHistory.unshift(command);
    
    // 限制历史记录大小
    if (this.commandHistory.length > 50) {
      this.commandHistory.pop();
    }
  }

  /**
   * 显示命令提示
   */
  async showPrompt(message: string = t('command.prompt')): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(message, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * 关闭readline接口
   */
  close(): void {
    this.rl.close();
  }

  /**
   * 获取历史记录
   */
  getHistory(): string[] {
    return [...this.commandHistory];
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.commandHistory = [];
    this.currentHistoryIndex = -1;
  }

  /**
   * 显示历史记录
   */
  showHistory(limit: number = 10): void {
    const history = this.commandHistory.slice(0, limit);
    
    if (history.length === 0) {
      console.log('📜 暂无命令历史记录');
      return;
    }

    console.log('📜 命令历史记录:');
    history.forEach((command, index) => {
      console.log(`  ${index + 1}. ${command}`);
    });
    console.log();
  }
} 