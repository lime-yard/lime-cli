"use strict";

const co = require("co");
const prompt = require("co-prompt");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;
const execSync = require("child_process").execSync;
const inquirer = require("inquirer");
const yeoman = require("yeoman-environment");
const axios = require("axios");

let gitUrl = "";

module.exports = () => {
  co(function*() {
    yield inquirer
      .prompt([
        {
          type: "list",
          name: "gitname",
          message: "请选择仓库",
          choices: [
            "快速页面",
            "React & Redux 项目",
            "React & Hooks 项目",
            "钉钉小程序TS版"
          ]
        }
      ])
      .then(answers => {
        console.log(answers);
        switch (answers.gitname) {
          case "快速页面":
            gitUrl = "https://github.com/lime-yard/lime-scaffold-quick-page.git";
            break;
          case "React & Redux 项目":
            gitUrl = "https://github.com/lime-yard/lime-scaffold-react-redux-app.git";
            break;
          case "React & Hooks 项目":
            gitUrl = "https://github.com/lime-yard/lime-scaffold-react-hooks-app.git";
            break;
          case "钉钉小程序TS版":
            gitUrl = "https://github.com/lime-yard/lime-scaffold-ding-mini-app-ts.git";
            break;
          default:
            gitUrl = "https://github.com/lime-yard/lime-scaffold-quick-page.git";
            break;
        }
      });

    let gitBranch = "master";
    let projectName = yield prompt("请输入项目名称：");
    if (projectName) {
      console.log(chalk.white("项目初始化开始..."));

      let cmdStr =
        "git clone " +
        gitUrl +
        " " +
        projectName +
        " && cd " +
        projectName +
        " && git checkout " +
        gitBranch +
        " && rm -rf .git";
      console.log(cmdStr);
      exec(cmdStr, (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          process.exit();
        }
        
        console.log(chalk.green("√ 项目初始化完成！"));
        console.log(
          chalk.grey("请执行 cd " + projectName + " && tnpm install")
        );
        
        process.exit();
      });
    } else {
      console.log("未输入项目名称，请重试");
      process.exit();
    }
  });
};
