[TOC]
### 本地调试react源码步骤
#### 1. 生成react项目
可以直接基于react cra cli生成项目，也可以自己基于react,webpack搭建环境，具体可以参考https://github.com/bozhouyongqi/react-redux-demo项目。下述主要针对使用cra的项目。
#### 2. yarn run eject 暴露出webpack配置
这一步没有没什么，可以看到会生成config目录，里面包括webpack的配置文件和一些环境定义。但是很不幸，运行yarn run start会编译失败。出现下述错误。
```
Failed to compile.

./src/index.js
Error: [BABEL] /xxx/debug-react-new/src/index.js: Cannot find module '@babel/plugin-syntax-jsx' (While processing: "xxx/debug-react-new/node_modules/babel-preset-react-app/index.js")
```

意思是缺少@babel/plugin-syntax-jsx这个模块，那直接安装就行。

```
yarn add @babel/plugin-syntax-jsx -D
```
之后再运行，就可以顺利启动项目了。
```
Compiled successfully!

You can now view debug-react-new in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.0.103:3000

Note that the development build is not optimized.
To create a production build, use yarn build.
```

#### 清理src目录
删除测试以及其他文件，只保留App等业务组件。并去除相关引用。

#### clone react源码至src目录下
这里使用git submodule命令引入react源码作为子模块，以方便后续代码单独管理。

进入src目录，执行 git submodule add git@github.com:facebook/react.git。

克隆之后，就可以在src/react中正常切换分支，而不影响主工程。我这里使用v16.13.1版本，因此可以切换至具体的tag.

git checkout tags/v16.13.1 -b v16.13.1

#### 修改webpack.config.js添加alias配置

注释掉原先的alias配置，添加新的，将react等指向本地
```
alias: {
    'react': path.resolve(__dirname, '../src/react/packages/react'),
    'react-dom': path.resolve(__dirname, '../src/react/packages/react-dom'),
    'shared': path.resolve(__dirname, '../src/react/packages/shared'),
    'react-reconciler': path.resolve(__dirname, '../src/react/packages/react-reconciler'),
    "legacy-events": path.resolve(__dirname, "../src/react/packages/legacy-events"),
    // 'react-events': path.resolve(__dirname, '../src/react/packages/events'),
    // scheduler: path.resolve(__dirname, "../src/react/packages/scheduler"),
},
```

然后再运行项目，发现会出现如下错误。
```
Failed to compile.

./src/packages/react-reconciler/src/ReactFiberDeprecatedEvents.js
Attempted import error: 'DEPRECATED_mountResponderInstance' is not exported from './ReactFiberHostConfig'.
```

#### 修改ReactFiberHostConfig文件
修改成如下
```
// We expect that our Rollup, Jest, and Flow configurations
// always shim this module with the corresponding host config
// (either provided by a renderer, or a generic shim for npm).
//
// We should never resolve to this file, but it exists to make
// sure that if we *do* accidentally break the configuration,
// the failure isn't silent.

// invariant(false, 'This module must be shimmed by a specific renderer.');

export * from './forks/ReactFiberHostConfig.dom';
```
从注释中可以看出，这个文件实际上react并不会直接引入，会被打包工具依赖相应的宿主环境替换掉。

之后再启动项目，发现会报如下错误
```
Failed to compile.

./src/index.js
Attempted import error: 'react' does not contain a default export (imported as 'React').
```

#### 修改react引用方式
出现上述错误，到源码中查看源码，发现/debug-react-new/src/packages/react/index.js中确实没有默认导出。但是必须保证业务组件中要引入React，因为组件需要用babel-jsx插件进行转换(即使用React.createElement方法)。因此可以添加一个中间模块文件，来适配该问题。

adaptation.js
```
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export {
    React,
    ReactDOM
};
```
之后在业务组件中从adaptation引入React和ReactDOM。

这一步之后，还是会出现新错误。

```
Failed to compile.

Failed to load config "fbjs" to extend from.
Referenced from: /Users/wangyongqi/baidu/learn/debug-react-new/src/react/.eslintrc.js
```















=================================

```
Failed to compile.

./src/index.js
Module not found: Can't resolve 'react/jsx-dev-runtime' in '/Users/wangyongqi/baidu/learn/debug-react-new/src'
```

### 修复react/jsx-dev-runtime报错

在webpack-config.js中可以看到hasJsxRuntime变量的取值过程，直接在函数中返回false.

修改完之后，还是会报错。
```
Failed to compile.

src/packages/legacy-events/EventPluginRegistry.js
  Line 144:7:   '__DEV__' is not defined  no-undef
  Line 184:42:  '__DEV__' is not defined  no-undef

src/packages/legacy-events/EventPluginUtils.js
  Line 23:7:   '__DEV__' is not defined  no-undef
  Line 34:5:   '__DEV__' is not defined  no-undef
  Line 78:7:   '__DEV__' is not defined  no-undef
  Line 106:7:  '__DEV__' is not defined  no-undef
  Line 147:7:  '__DEV__' is not defined  no-undef

src/packages/legacy-events/EventPropagators.js
  Line 47:7:  '__DEV__' is not defined  no-undef
```




