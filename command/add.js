"use strict";

const fs = require("fs");
const path = require("path");
const co = require("co");
const prompt = require("co-prompt");
const chalk = require("chalk");
const inquirer = require("inquirer");

function writeFileMe(filename, content) {
  fs.writeFileSync(filename, content, {
    encoding: "utf8"
  });
}

module.exports = options => {
  var type, jsTpl;

  if (options.container) {
    type = "容器型组件";
    jsTpl = "ctlComponent.tpl.js";
  } else if (options.simple) {
    type = "无状态组件";
    jsTpl = "unstate.tpl.js";
  } else if (options.dm) {
    co(function*() {
      //获取业务组件类型
      const answers = yield inquirer.prompt([
        {
          type: "list",
          name: "type",
          message: "请选择组件模板",
          choices: [
            {
              name: "默认（dingui-mini默认业务组件模板）",
              value: "default"
            },
            {
              name: "教育线（教育线ts组件模板）",
              value: "edu"
            }
          ]
        }
      ]);
      console.log(answers);
      const initComponent = require("./dinguiMiniScripts/add");
      initComponent(answers.type);
    });
    require("./dinguiMiniScripts/add.js");
    return;
  } else {
    type = "展示型组件";
    jsTpl = "component.tpl.js";
  }

  co(function*() {
    //获取组件名
    var name = yield prompt(`请输入要创建的${type}的名称：`);

    if (/^[a-zA-Z]+$/.test(name)) {
      var componentName = name.charAt(0).toUpperCase() + name.substr(1);
      var lowerName = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      var indexTplContent,
        lessTplContent,
        jsTplContent,
        indexContent,
        lessContent,
        jsContent;
      console.log(`开始在当前路径下创建${type}组件${componentName}`);

      indexTplContent = fs.readFileSync(
        `${__dirname}/../component-tpl/index.tpl.js`,
        "utf8"
      );
      lessTplContent = fs.readFileSync(
        `${__dirname}/../component-tpl/tpl.less`,
        "utf8"
      );
      jsTplContent = fs.readFileSync(
        `${__dirname}/../component-tpl/${jsTpl}`,
        "utf8"
      );

      indexContent = indexTplContent.replace(/\$name\$/g, componentName);
      lessContent = lessTplContent.replace(/\$lowerName\$/g, lowerName);
      jsContent = jsTplContent
        .replace(/\$name\$/g, componentName)
        .replace(/\$lowerName\$/g, lowerName);

      fs.access(componentName, function(err) {
        if (!err) {
          //存在该文件夹
          console.log(
            chalk.yellow(
              `已存在${componentName}文件夹，正在覆盖${componentName}组件...`
            )
          );
          writeFileMe(`${componentName}/index.js`, indexContent);
          writeFileMe(`${componentName}/${componentName}.less`, lessContent);
          writeFileMe(`${componentName}/${componentName}.js`, jsContent);
          console.log(chalk.green(`${type}组件${componentName}创建成功`));
          process.exit();
        } else {
          fs.mkdir(componentName, function(err) {
            if (err) throw err;
            else {
              writeFileMe(`${componentName}/index.js`, indexContent);
              writeFileMe(
                `${componentName}/${componentName}.less`,
                lessContent
              );
              writeFileMe(`${componentName}/${componentName}.js`, jsContent);
              console.log(chalk.green(`${type}组件${componentName}创建成功`));
              process.exit();
            }
          });
        }
      });
    } else {
      console.log(
        chalk.red("组件名称含有无效字符！请输入纯字母组合的组件名称")
      );
      process.exit();
    }
  });
};
