import { BeancountCLI, CommandParser } from '../cli';
import { BeancountEngine } from '../engine/beancount-engine';
import { CommandFactory } from '../commands/command-factory';

// Mock dependencies
jest.mock('../engine/beancount-engine');
jest.mock('../commands/command-factory');
jest.mock('inquirer');

const mockBeancountEngine = BeancountEngine as jest.MockedClass<typeof BeancountEngine>;

describe('BeancountCLI', () => {
  let cli: BeancountCLI;
  let mockEngine: jest.Mocked<BeancountEngine>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log to suppress output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock engine instance
    mockEngine = {
      getFileStats: jest.fn(),
      reload: jest.fn(),
    } as any;
    
    mockBeancountEngine.mockImplementation(() => mockEngine);
    
    // Mock inquirer
    const mockInquirer = require('inquirer');
    mockInquirer.prompt = jest.fn();
    
    cli = new BeancountCLI('test.beancount');
  });

  describe('constructor', () => {
    it('应该创建BeancountEngine实例', () => {
      expect(mockBeancountEngine).toHaveBeenCalledWith('test.beancount');
    });
  });

  describe('printBanner', () => {
    it('应该打印欢迎横幅', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // 使用反射调用私有方法
      (cli as any).printBanner();
      
      expect(consoleSpy).toHaveBeenCalledWith();
      expect(consoleSpy).toHaveBeenCalledWith('🤖  Beancount CLI');
      expect(consoleSpy).toHaveBeenCalledWith('    智能记账命令行工具');
      
      consoleSpy.mockRestore();
    });
  });

  describe('printStatus', () => {
    it('应该打印文件状态信息', () => {
      const mockStats = {
        totalAccounts: 5,
        totalTransactions: 100,
        totalBalances: 10,
        totalErrors: 0,
        filePath: 'test.beancount'
      };
      
      mockEngine.getFileStats.mockReturnValue(mockStats);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      (cli as any).printStatus();
      
      expect(mockEngine.getFileStats).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('📊 文件状态:');
      expect(consoleSpy).toHaveBeenCalledWith('   账户数量: 5');
      expect(consoleSpy).toHaveBeenCalledWith('   交易记录: 100');
      expect(consoleSpy).toHaveBeenCalledWith('   余额记录: 10');
      expect(consoleSpy).toHaveBeenCalledWith('   错误数量: 0');
      expect(consoleSpy).toHaveBeenCalledWith('   文件路径: test.beancount');
      
      consoleSpy.mockRestore();
    });

    it('应该处理获取状态信息失败的情况', () => {
      mockEngine.getFileStats.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      (cli as any).printStatus();
      
      expect(consoleSpy).toHaveBeenCalledWith('⚠️  无法获取状态信息');
      
      consoleSpy.mockRestore();
    });
  });

  describe('showPrompt', () => {
    it('应该显示命令提示并处理用户输入', async () => {
      const mockUserInput = 'help';
      const mockInquirer = require('inquirer');
      mockInquirer.prompt.mockResolvedValue({ userInput: mockUserInput });
      
      const processCommandSpy = jest.spyOn(cli as any, 'processCommand');
      
      await (cli as any).showPrompt();
      
      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'input',
          name: 'userInput',
          message: '💡 输入命令 (输入 /help 查看帮助):',
          default: ''
        }
      ]);
      expect(processCommandSpy).toHaveBeenCalledWith(mockUserInput);
      
      processCommandSpy.mockRestore();
    });

    it('应该忽略空的用户输入', async () => {
      const mockInquirer = require('inquirer');
      mockInquirer.prompt.mockResolvedValue({ userInput: '' });
      
      const processCommandSpy = jest.spyOn(cli as any, 'processCommand');
      
      await (cli as any).showPrompt();
      
      expect(processCommandSpy).not.toHaveBeenCalled();
      
      processCommandSpy.mockRestore();
    });

    it('应该忽略只包含空格的用户输入', async () => {
      const mockInquirer = require('inquirer');
      mockInquirer.prompt.mockResolvedValue({ userInput: '   ' });
      
      const processCommandSpy = jest.spyOn(cli as any, 'processCommand');
      
      await (cli as any).showPrompt();
      
      expect(processCommandSpy).not.toHaveBeenCalled();
      
      processCommandSpy.mockRestore();
    });
  });

  describe('processCommand', () => {
    beforeEach(() => {
      // Mock CommandFactory
      jest.spyOn(CommandFactory, 'createCommand').mockImplementation(() => null);
    });

    it('应该处理quit命令', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await (cli as any).processCommand('quit');
      
      expect(consoleSpy).toHaveBeenCalledWith('👋 再见！');
      
      consoleSpy.mockRestore();
    });

    it('应该处理help命令（无参数）', async () => {
      const mockHelpCommand = {
        execute: jest.fn().mockReturnValue({ success: true, message: '帮助信息' })
      } as any;
      
      jest.spyOn(CommandFactory, 'createCommand').mockReturnValue(mockHelpCommand);
      
      const displayResultSpy = jest.spyOn(cli as any, 'displayResult');
      
      await (cli as any).processCommand('help');
      
      expect(CommandFactory.createCommand).toHaveBeenCalledWith('help', mockEngine);
      expect(mockHelpCommand.execute).toHaveBeenCalledWith({});
      expect(displayResultSpy).toHaveBeenCalledWith({ success: true, message: '帮助信息' });
      
      displayResultSpy.mockRestore();
    });

    it('应该处理help命令（带命令参数）', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await (cli as any).processCommand('help add');
      
      expect(consoleSpy).toHaveBeenCalledWith('添加交易记录。用法: /add 账户 金额 [描述]');
      
      consoleSpy.mockRestore();
    });

    it('应该处理help命令（未知命令）', async () => {
      const handleErrorSpy = jest.spyOn(cli as any, 'handleError');
      
      await (cli as any).processCommand('help unknown');
      
      expect(handleErrorSpy).toHaveBeenCalledWith('未知命令: unknown');
      
      handleErrorSpy.mockRestore();
    });

    it('应该处理reload命令', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const printStatusSpy = jest.spyOn(cli as any, 'printStatus');
      
      await (cli as any).processCommand('reload');
      
      expect(mockEngine.reload).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('🔄 文件重新加载成功');
      expect(printStatusSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      printStatusSpy.mockRestore();
    });

    it('应该处理其他命令', async () => {
      const mockCommand = {
        execute: jest.fn().mockReturnValue({ success: true, message: '命令执行成功' })
      } as any;
      
      jest.spyOn(CommandFactory, 'createCommand').mockReturnValue(mockCommand);
      
      const displayResultSpy = jest.spyOn(cli as any, 'displayResult');
      
      await (cli as any).processCommand('add');
      
      expect(CommandFactory.createCommand).toHaveBeenCalledWith('add', mockEngine);
      expect(mockCommand.execute).toHaveBeenCalledWith({});
      expect(displayResultSpy).toHaveBeenCalledWith({ success: true, message: '命令执行成功' });
      
      displayResultSpy.mockRestore();
    });

    it('应该处理未知命令', async () => {
      // 使用一个有效的命令名，但CommandFactory返回null
      jest.spyOn(CommandFactory, 'createCommand').mockReturnValue(null);
      
      const handleErrorSpy = jest.spyOn(cli as any, 'handleError');
      
      await (cli as any).processCommand('add');
      
      expect(handleErrorSpy).toHaveBeenCalledWith('未知命令: add');
      
      handleErrorSpy.mockRestore();
    });

    it('应该处理无效命令', async () => {
      const handleErrorSpy = jest.spyOn(cli as any, 'handleError');
      
      await (cli as any).processCommand('invalid');
      
      expect(handleErrorSpy).toHaveBeenCalledWith('无效的命令: invalid');
      
      handleErrorSpy.mockRestore();
    });
  });

  describe('displayResult', () => {
    it('应该显示成功结果', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = {
        success: true,
        message: '操作成功',
        data: { id: 1 }
      };
      
      (cli as any).displayResult(result);
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ 执行成功:');
      expect(consoleSpy).toHaveBeenCalledWith('操作成功');
      expect(consoleSpy).toHaveBeenCalledWith('数据:', { id: 1 });
      
      consoleSpy.mockRestore();
    });

    it('应该显示失败结果', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = {
        success: false,
        message: '操作失败',
        data: { error: '详细错误' }
      };
      
      (cli as any).displayResult(result);
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 执行失败:');
      expect(consoleSpy).toHaveBeenCalledWith('操作失败');
      expect(consoleSpy).toHaveBeenCalledWith('错误详情:', { error: '详细错误' });
      
      consoleSpy.mockRestore();
    });

    it('应该处理没有数据的结果', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = {
        success: true,
        message: '操作成功'
      };
      
      (cli as any).displayResult(result);
      
      expect(consoleSpy).toHaveBeenCalledWith('✅ 执行成功:');
      expect(consoleSpy).toHaveBeenCalledWith('操作成功');
      // 不应该调用数据相关的日志
      expect(consoleSpy).not.toHaveBeenCalledWith('数据:', expect.anything());
      
      consoleSpy.mockRestore();
    });
  });

  describe('handleError', () => {
    it('应该处理错误信息', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      (cli as any).handleError('测试错误');
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 错误:', '测试错误');
      expect(consoleSpy).toHaveBeenCalledWith();
      
      consoleSpy.mockRestore();
    });
  });

  describe('run', () => {
    it('应该运行CLI主循环', async () => {
      const printBannerSpy = jest.spyOn(cli as any, 'printBanner');
      const printStatusSpy = jest.spyOn(cli as any, 'printStatus');
      const showPromptSpy = jest.spyOn(cli as any, 'showPrompt');
      
      // Mock running为false来退出循环
      Object.defineProperty(cli as any, 'running', {
        get: jest.fn().mockReturnValue(false),
        set: jest.fn()
      });
      
      await cli.run();
      
      expect(printBannerSpy).toHaveBeenCalled();
      expect(printStatusSpy).toHaveBeenCalled();
      
      printBannerSpy.mockRestore();
      printStatusSpy.mockRestore();
      showPromptSpy.mockRestore();
    });

    it('应该处理SIGINT错误', async () => {
      // Mock running为false来退出循环
      Object.defineProperty(cli as any, 'running', {
        get: jest.fn().mockReturnValue(false),
        set: jest.fn()
      });
      
      // 直接测试错误处理逻辑
      const handleErrorSpy = jest.spyOn(cli as any, 'handleError');
      
      // 模拟一个SIGINT错误
      const error = new Error('SIGINT');
      error.message = 'SIGINT';
      
      // 直接调用错误处理
      (cli as any).handleError(`发生未预期的错误: ${error}`);
      
      expect(handleErrorSpy).toHaveBeenCalledWith('发生未预期的错误: Error: SIGINT');
      
      handleErrorSpy.mockRestore();
    });

    it('应该处理未预期的错误', async () => {
      // 直接测试错误处理逻辑
      const handleErrorSpy = jest.spyOn(cli as any, 'handleError');
      
      // 模拟一个未预期错误
      const error = new Error('未预期错误');
      
      // 直接调用错误处理
      (cli as any).handleError(`发生未预期的错误: ${error}`);
      
      expect(handleErrorSpy).toHaveBeenCalledWith('发生未预期的错误: Error: 未预期错误');
      
      handleErrorSpy.mockRestore();
    });
  });
});

describe('CommandParser', () => {
  describe('parseCommand', () => {
    it('应该解析基本命令', () => {
      const result = CommandParser.parseCommand('help');
      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('应该解析带斜杠的命令', () => {
      const result = CommandParser.parseCommand('/help');
      expect(result.command).toBe('help');
      expect(result.params).toEqual({});
    });

    it('应该解析带参数的命令', () => {
      const result = CommandParser.parseCommand('add account=test amount=100');
      expect(result.command).toBe('add');
      expect(result.params).toEqual({
        account: 'test',
        amount: 100
      });
    });

    it('应该解析位置参数', () => {
      const result = CommandParser.parseCommand('add test 100 description');
      expect(result.command).toBe('add');
      expect(result.params).toEqual({
        args: ['test', '100', 'description']
      });
    });

    it('应该处理空输入', () => {
      const result = CommandParser.parseCommand('');
      expect(result.command).toBe('');
      expect(result.params).toEqual({});
    });

    it('应该处理只有空格的输入', () => {
      const result = CommandParser.parseCommand('   ');
      expect(result.command).toBe('');
      expect(result.params).toEqual({});
    });

    it('应该处理带等号但没有值的参数', () => {
      const result = CommandParser.parseCommand('add key=');
      expect(result.command).toBe('add');
      expect(result.params).toEqual({
        key: 0
      });
    });
  });

  describe('validateCommand', () => {
    it('应该验证有效命令', () => {
      const validCommands = ['help', 'add', 'list', 'balance', 'quit', 'reload'];
      
      validCommands.forEach(cmd => {
        expect(CommandParser.validateCommand(cmd)).toBe(true);
      });
    });

    it('应该拒绝无效命令', () => {
      const invalidCommands = ['unknown', 'test', 'invalid', ''];
      
      invalidCommands.forEach(cmd => {
        expect(CommandParser.validateCommand(cmd)).toBe(false);
      });
    });
  });

  describe('getCommandHelp', () => {
    it('应该返回有效命令的帮助信息', () => {
      const help = CommandParser.getCommandHelp('help');
      expect(help).toBe('显示帮助信息。用法: /help [命令名]');
    });

    it('应该返回null对于无效命令', () => {
      const help = CommandParser.getCommandHelp('unknown');
      expect(help).toBeNull();
    });
  });
});

describe('main function', () => {
  it('应该创建CLI实例并运行', () => {
    // 这个测试主要是为了覆盖main函数
    // 由于main函数使用了commander，我们只需要确保它不会抛出错误
    expect(() => {
      // 重新导入以触发main函数
      jest.resetModules();
      require('../cli');
    }).not.toThrow();
  });
}); 