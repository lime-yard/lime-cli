#!/usr/bin/env node --harmony
'use strict'
 // 定义脚手架的文件路径
process.env.NODE_PATH = __dirname + '/../node_modules/';

const program = require('commander');

 // 定义当前版本
program
	.version(require('../package').version );

// 定义使用方法
program
	.usage('<command>');

program
	.command('init')
	.description('初始化项目')
	.alias('i')
	.action(function(){
		require("../command/init")();
	})

program
	.command('add')
	.description('新建组件')
	.option('-p, --presentational', '新建展示型组件，与redux无关的组件')
	.option('-c, --container', '新建容器型组件，与redux有关的组件')
	.option('-s, --simple', '新建无状态组件')
	.option('-d, --dm', '新建dingui-mini业务组件')
	.alias('a')
	.action(function(options){
		require("../command/add")(options);
	})

program
	.command('server')
	.description('为项目启服务')
	.option('-p, --port <string>', '端口号设置')
	.action(function(options){
		require("../command/server")(options);
	})

program.parse(process.argv);

// 帮助文档
if(!program.args.length){
  program.help()
}