var webpack = require("webpack");
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require("webpack-hot-middleware");
var path = require("path");
var http = require("http");
var chalk = require("chalk");
var myIp = require("my-ip")();
var url = require("url");
var fs = require("fs");
var proxy = require("http-proxy-middleware");
var globby = require("globby");

module.exports = function(options) {
  // var configPath = options.path;
  var port = options.port || 8000;
  try {
    var config = require(path.join(process.cwd(), "webpack.config.js"));
    var pkg = require(path.join(process.cwd(), "package.json"));
    var proxyConfigPath = path.join(process.cwd(), "proxy.config.json");
    var middlewarePath = path.join(process.cwd(), "middlewares");
  } catch (e) {}
  if (fs.existsSync(proxyConfigPath)) {
    var proxyConfig = require(proxyConfigPath);
  }
  var app = require("express")();
  var htmlRoot = {
    name: "index.html",
    url: "index.html"
  };

  var staticUrl = [];
  var tmpUrl;
  var compiler = webpack(config);
  app.use(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath
    })
  );
  app.use(webpackHotMiddleware(compiler));

  if (fs.existsSync(middlewarePath)) {
    var middlewares = globby.sync("*/index.js", {
      cwd: middlewarePath
    });

    for (const mw of middlewares) {
      const file = path.join(middlewarePath, mw);
      console.log(chalk.green("register middleware: " + file));
      require(file)(app);
    }
  }

  if (proxyConfig && Array.isArray(proxyConfig.proxy)) {
    proxyConfig.proxy.forEach(function(item) {
      var setObject = {
        target: item.target,
        secure: false,
        changeOrigin: true
      };
      if (item.pathRewrite) {
        setObject.pathRewrite = function(path, req) {
          return path.replace(item.router, "");
        };
      }
      app.use(item.router, proxy(setObject));
    });
  }
  app.all("*", function(req, res) {
    var url = req.url.split("?")[0];
    url = url.split("#")[0];
    res.sendFile(path.join(process.cwd(), url));
  });
  const startServer = (currentPort = port) => {
    http
      .createServer(app)
      .listen(currentPort, function(error) {
        if (error) {
          console.log(chalk.red(error));
        } else {
          console.log(
            chalk.green(
              "==> Listening on port " +
                currentPort +
                ". Open up http://" +
                myIp +
                ":" +
                currentPort +
                "/ in your browser."
            )
          );
        }
      })
      .on("error", err => {
        if (err.code === "EADDRINUSE") {
          const nextPort = currentPort + 1;
          console.log(
            chalk.green(
              `端口号：${currentPort}已被占用，使用${nextPort}重新启动dev server！`
            )
          );
          return startServer(nextPort);
        }
        throw err;
      });
  };
  startServer();
};
