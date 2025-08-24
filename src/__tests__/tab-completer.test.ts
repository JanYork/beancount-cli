/**
 * TabCompleter 测试
 * 测试Tab补全功能
 */

import { TabCompleter } from '../presentation/cli/tab-completer';
import { CommandCompleter, CommandSuggestion } from '../utils/command-completer';

// Mock CommandCompleter
jest.mock('../utils/command-completer');
const mockCommandCompleter = CommandCompleter as jest.Mocked<typeof CommandCompleter>;

// Mock readline
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn(),
    write: jest.fn(),
    on: jest.fn(),
  })),
}));

// Mock process.stdin
const mockStdin = {
  on: jest.fn(),
};
Object.defineProperty(process, 'stdin', {
  value: mockStdin,
  writable: true,
});

// 创建模拟的CommandSuggestion对象
const createMockSuggestion = (command: string): CommandSuggestion => ({
  command,
  description: `Description for ${command}`,
  usage: `${command} [参数]`,
  category: 'basic',
});

describe('TabCompleter', () => {
  let tabCompleter: TabCompleter;
  let mockRl: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock readline interface
    const readline = require('readline');
    mockRl = {
      question: jest.fn(),
      close: jest.fn(),
      write: jest.fn(),
      on: jest.fn(),
    };
    readline.createInterface.mockReturnValue(mockRl);
    
    tabCompleter = new TabCompleter();
  });

  afterEach(() => {
    tabCompleter.close();
  });

  describe('constructor', () => {
    it('应该创建readline接口并设置键盘绑定', () => {
      const readline = require('readline');
      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout,
        completer: expect.any(Function),
        terminal: true,
      });
      expect(mockStdin.on).toHaveBeenCalledWith('keypress', expect.any(Function));
    });
  });

  describe('completer', () => {
    it('应该为以/开头的命令提供补全建议', () => {
      mockCommandCompleter.getSuggestions.mockReturnValue([
        createMockSuggestion('help'),
        createMockSuggestion('add_transaction')
      ]);
      
      const readline = require('readline');
      const completer = readline.createInterface.mock.calls[0][0].completer;
      
      const result = completer('/he');
      
      expect(result).toEqual([['/help', '/add_transaction'], '/he']);
      expect(mockCommandCompleter.getSuggestions).toHaveBeenCalledWith('he');
    });

    it('应该为不以/开头的输入添加/前缀', () => {
      mockCommandCompleter.getSuggestions.mockReturnValue([
        createMockSuggestion('help')
      ]);
      
      const readline = require('readline');
      const completer = readline.createInterface.mock.calls[0][0].completer;
      
      const result = completer('he');
      
      expect(result).toEqual([['/help'], '/he']);
      expect(mockCommandCompleter.getSuggestions).toHaveBeenCalledWith('he');
    });

    it('应该在没有建议时返回空数组', () => {
      mockCommandCompleter.getSuggestions.mockReturnValue([]);
      
      const readline = require('readline');
      const completer = readline.createInterface.mock.calls[0][0].completer;
      
      const result = completer('/invalid');
      
      expect(result).toEqual([[], '/invalid']);
    });

    it('应该在有多个建议时返回所有选项', () => {
      mockCommandCompleter.getSuggestions.mockReturnValue([
        createMockSuggestion('help'),
        createMockSuggestion('add_transaction'),
        createMockSuggestion('list_transactions')
      ]);
      
      const readline = require('readline');
      const completer = readline.createInterface.mock.calls[0][0].completer;
      
      const result = completer('/');
      
      expect(result).toEqual([['/help', '/add_transaction', '/list_transactions'], '/']);
    });
  });

  describe('showPrompt', () => {
    it('应该显示提示并返回用户输入', async () => {
      const mockInput = '/help';
      mockRl.question.mockImplementation((_message: string, callback: (input: string) => void) => {
        callback(mockInput);
      });

      const result = await tabCompleter.showPrompt('测试提示');

      expect(mockRl.question).toHaveBeenCalledWith('测试提示', expect.any(Function));
      expect(result).toBe(mockInput);
    });

    it('应该使用默认提示消息', async () => {
      const mockInput = '/help';
      mockRl.question.mockImplementation((_message: string, callback: (input: string) => void) => {
        callback(mockInput);
      });

      await tabCompleter.showPrompt();

      expect(mockRl.question).toHaveBeenCalledWith(expect.stringContaining('输入命令'), expect.any(Function));
    });
  });

  describe('history management', () => {
    it('应该添加命令到历史记录', () => {
      const command = '/help';
      
      // 模拟line事件
      const lineHandler = mockRl.on.mock.calls.find((call: any[]) => call[0] === 'line')[1];
      lineHandler(command);

      expect(tabCompleter.getHistory()).toContain(command);
    });

    it('应该避免重复添加相同的命令', () => {
      const command = '/help';
      
      // 模拟line事件
      const lineHandler = mockRl.on.mock.calls.find((call: any[]) => call[0] === 'line')[1];
      lineHandler(command);
      lineHandler(command);

      const history = tabCompleter.getHistory();
      expect(history.filter(cmd => cmd === command)).toHaveLength(1);
    });

    it('应该限制历史记录大小', () => {
      const lineHandler = mockRl.on.mock.calls.find((call: any[]) => call[0] === 'line')[1];
      
      // 添加51个命令
      for (let i = 0; i < 51; i++) {
        lineHandler(`/command${i}`);
      }

      expect(tabCompleter.getHistory()).toHaveLength(50);
      expect(tabCompleter.getHistory()[0]).toBe('/command50');
    });

    it('应该清空历史记录', () => {
      const lineHandler = mockRl.on.mock.calls.find((call: any[]) => call[0] === 'line')[1];
      lineHandler('/help');
      
      expect(tabCompleter.getHistory()).toHaveLength(1);
      
      tabCompleter.clearHistory();
      expect(tabCompleter.getHistory()).toHaveLength(0);
    });
  });

  describe('showHistory', () => {
    it('应该显示历史记录', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const lineHandler = mockRl.on.mock.calls.find((call: any[]) => call[0] === 'line')[1];
      lineHandler('/help');
      lineHandler('/add_transaction');
      
      tabCompleter.showHistory(2);
      
      expect(consoleSpy).toHaveBeenCalledWith('📜 命令历史记录:');
      expect(consoleSpy).toHaveBeenCalledWith('  1. /add_transaction');
      expect(consoleSpy).toHaveBeenCalledWith('  2. /help');
      
      consoleSpy.mockRestore();
    });

    it('应该在历史记录为空时显示相应消息', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tabCompleter.showHistory();
      
      expect(consoleSpy).toHaveBeenCalledWith('📜 暂无命令历史记录');
      
      consoleSpy.mockRestore();
    });
  });

  describe('close', () => {
    it('应该关闭readline接口', () => {
      tabCompleter.close();
      expect(mockRl.close).toHaveBeenCalled();
    });
  });
}); 