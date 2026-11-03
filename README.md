# React 井字棋练习

## 项目简介

这是一个使用 React 函数组件编写的井字棋项目，用于练习组件拆分、props 传递、事件处理、`useState`、状态提升和不可变数据更新。项目使用 `react-scripts` 提供开发、构建和测试命令，无需手动配置打包工具。

玩家在 3 × 3 棋盘上交替落下 X 和 O，X 先手。当前实现支持：

- 阻止在已有棋子的格子上重复落子。
- 检查横向、纵向和对角线的胜利组合，获胜后阻止继续落子。
- 保存每一步棋盘快照，通过右侧按钮回到开局或任意历史步骤。
- 在历史步骤上继续落子，舍弃该步骤之后的旧记录，生成新的历史。

当前界面展示棋盘和历史按钮，尚未显示获胜者、下一位玩家或平局提示。历史记录保存在组件状态中，刷新页面会重置游戏。项目没有后端服务或数据存储。

## 初始化依赖与运行

本地需要安装 Node.js 和 npm。仓库没有通过 `engines` 或版本文件固定 Node.js 版本，可先检查本机环境：

```powershell
node --version
npm --version
```

在项目根目录执行以下命令，按照已有的 `package-lock.json` 安装依赖并启动开发服务：

```powershell
npm ci
npm start
```

启动后按照终端提示访问开发地址，默认地址为 [http://localhost:3000](http://localhost:3000)。在终端按 `Ctrl+C` 停止服务。

如果需要新增或调整依赖，使用 `npm install <包名>`，并同步保留更新后的 `package.json` 和 `package-lock.json`。`npm ci` 用于按锁文件重新安装依赖，会清理已有的 `node_modules`；如果依赖声明和锁文件不一致，它会报错。

### 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm ci` | 根据锁文件安装依赖，适合首次拉取项目或重新安装。 |
| `npm start` | 启动开发服务器。 |
| `npm run build` | 生成生产构建，输出到 `build/`。 |
| `npm test` | 运行 `react-scripts` 的测试命令；当前仓库尚未编写测试文件。 |
| `npm run eject` | 导出构建配置；通常无需执行，执行后无法通过对应命令自动撤销。 |

### 主要依赖

以下版本范围来自 `package.json`，实际安装版本由 `package-lock.json` 锁定。

| 依赖 | 声明版本 | 用途 |
| --- | --- | --- |
| `react` | `^19.2.1` | 定义组件、处理状态并生成 UI 描述。 |
| `react-dom` | `^19.2.1` | 将 React 组件渲染到浏览器 DOM。 |
| `react-scripts` | `^5.0.0` | 提供开发服务器、构建和测试工具。 |

## 项目结构与文件作用

```text
react-practice/
├── public/
│   └── index.html       # HTML 模板，提供 root 挂载节点
├── src/
│   ├── index.js         # React 入口，创建根节点并渲染应用
│   ├── App.js           # 井字棋组件、胜负判断和历史记录逻辑
│   └── styles.css       # 全局样式、棋盘样式和页面布局
├── .gitignore           # 当前忽略 node_modules
├── package.json         # 项目信息、依赖声明、脚本和目标浏览器配置
├── package-lock.json    # npm 依赖锁文件
└── README.md            # 项目说明
```

运行安装命令后会生成 `node_modules/`，运行构建命令后会生成 `build/`，它们不属于上面列出的源码文件。

| 文件 | 具体作用 |
| --- | --- |
| `public/index.html` | 提供 `<div id="root"></div>`，React 将应用挂载到这个节点中。 |
| `src/index.js` | 引入全局样式和 `App.js` 的默认导出，调用 `createRoot` 与 `root.render`，并用 `StrictMode` 包裹应用。 |
| `src/App.js` | 定义 `Square`、`Board`、`Game` 三个组件，以及 `calculateWinner` 函数。默认导出的是 `Game`，入口将它命名为 `App` 导入。 |
| `src/styles.css` | 设置全局字体与间距、方格按钮大小和边框、棋盘行清除浮动，以及棋盘与历史列表的横向布局。 |
| `package.json` | 声明 React 等依赖，以及 `start`、`build`、`test`、`eject` 脚本。 |
| `package-lock.json` | 记录依赖树和具体版本，使安装结果保持一致。 |
| `.gitignore` | 当前只配置忽略 `node_modules`。 |

## App.js 中的组件与函数

组件关系如下：

```text
Game（默认导出，由 index.js 以 App 名称导入）
├── Board
│   └── Square × 9
└── 历史步骤列表
    └── 每个按钮调用 jumpTo(move)
```

| 组件或函数 | 输入 | 职责 |
| --- | --- | --- |
| `Game()` | 无 props | 保存历史和当前步骤，推导棋盘与落子方，渲染棋盘和历史列表。 |
| `Board({ xIsNext, squares, onPlay })` | 落子方、当前棋盘、更新回调 | 渲染九个格子，通过内部的 `handleClick` 处理落子。 |
| `Square({ value, onSquareClick })` | 格子内容、点击回调 | 渲染一个按钮，将点击事件交给传入的回调。自身没有状态。 |
| `handleClick(i)` | 格子索引 `0` 至 `8` | 拦截无效落子，复制棋盘并写入棋子，调用 `onPlay`。定义在 `Board` 内部。 |
| `calculateWinner(squares)` | 九个格子组成的数组 | 检查八种连线组合，返回 `"X"`、`"O"` 或 `null`。 |
| `handlePlay(nextSquares)` | 落子后的棋盘 | 截取有效历史、追加新快照，并更新当前步骤。定义在 `Game` 内部。 |
| `jumpTo(nextMove)` | 历史步骤索引 | 更新当前步骤，使界面显示对应棋盘。定义在 `Game` 内部。 |

### 状态与派生数据

游戏状态集中保存在 `Game` 中，`Board` 和 `Square` 通过 props 获取数据。

| 名称 | 初始值或计算方式 | 含义 |
| --- | --- | --- |
| `history` | `[Array(9).fill(null)]` | 棋盘快照数组。第 `0` 项为空棋盘，之后每项对应一次有效落子。 |
| `currentMove` | `0` | 当前正在查看的历史步骤。 |
| `currentSquares` | `history[currentMove]` | 当前要展示的棋盘，由已有状态计算得出。 |
| `xIsNext` | `currentMove % 2 === 0` | 偶数步骤由 X 落子，奇数步骤由 O 落子。 |
| `moves` | `history.map(...)` | 把每一条历史记录转换为带有跳转按钮的列表项。 |

棋盘数组的索引与页面位置对应如下，空格用 `null` 表示，落子后为 `"X"` 或 `"O"`：

```text
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

## App.js 的执行流程

### 1. 首次渲染

1. `src/index.js` 找到 HTML 中的 `root` 节点，调用 `root.render` 渲染 `<App />`，对应 `App.js` 默认导出的 `Game`。
2. React 执行 `Game()`，通过两个 `useState` 初始化 `history` 和 `currentMove`。
3. `Game` 根据当前步骤计算 `currentSquares` 和 `xIsNext`，此时是空棋盘，轮到 X。
4. `history.map(...)` 生成历史按钮，首次只有 `Go to game start`。
5. `Game` 返回 JSX，React 渲染 `Board` 及其九个 `Square`，页面显示棋盘和历史列表。

函数在文件中的书写顺序不等于运行顺序。首次渲染会执行组件函数和 `history.map` 的回调；`handleClick`、`handlePlay` 和 `jumpTo` 在相应事件发生时才被调用。

入口启用了 `StrictMode`，开发模式下可能额外调用组件函数以帮助发现问题，因此调试日志不一定只出现一次。

### 2. 点击格子并落子

```text
点击 Square 的 button
  → onSquareClick()
  → Board 中的 handleClick(i)
  → 校验格子是否为空、当前棋盘是否已有赢家
  → 复制 squares，在索引 i 写入 X 或 O
  → onPlay(nextSquares)
  → Game 中的 handlePlay(nextSquares)
  → setHistory(nextHistory) 与 setCurrentMove(...)
  → React 重新渲染 Game、Board 和 Square
  → 页面展示新棋盘与新的历史按钮
```

`Square` 的按钮使用 `onClick={onSquareClick}`。`Board` 传入的回调是 `() => handleClick(i)`，它将格子索引保存在闭包中，等点击发生后再调用 `handleClick`。

`handleClick` 先检查：

```js
if (squares[i] || calculateWinner(squares)) {
  return;
}
```

如果已有棋子，直接返回；由于 `||` 短路，此时不会执行胜负检查。如果格子为空，则检查当前棋盘是否已有赢家，有赢家也直接返回。通过检查后，函数调用 `squares.slice()` 创建新数组，再写入当前玩家的棋子，最后通过 `onPlay(nextSquares)` 把新棋盘交回 `Game`。

这里检查的是落子前的棋盘。本次落子若形成胜利，棋子会正常显示，之后的点击会被拦截。

### 3. 保存历史并重新渲染

`onPlay` 实际接收到的是 `Game` 中的 `handlePlay`：

```js
const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
setHistory(nextHistory);
setCurrentMove(nextHistory.length - 1);
```

`history.slice(0, currentMove + 1)` 保留从开局到当前步骤的快照，再追加新棋盘。`currentMove` 随后指向新历史的最后一项。

状态更新会安排重新渲染。React 会在该事件处理中批量处理这两个更新；下一次执行 `Game` 时，`useState` 返回更新后的状态，再重新计算棋盘、落子方和历史按钮。调用 setter 不会立即改变当前回调中已经读取的状态变量。

比如首次点击左上角后，`history` 包含空棋盘和左上角为 X 的棋盘，`currentMove` 为 `1`，因此下一次轮到 O。

### 4. 回到历史步骤并继续游戏

点击历史列表按钮时，执行 `() => jumpTo(move)`，再由 `jumpTo` 调用 `setCurrentMove(nextMove)`。它只切换当前步骤，保留整个 `history`，所以仍可跳到其他已保存步骤。

重新渲染时，`currentSquares = history[currentMove]` 让棋盘回到指定快照，`xIsNext` 根据该步骤的奇偶性重新确定落子方。

如果此时继续落子，`handlePlay` 会舍弃当前步骤之后的旧历史。比如原本保存到第 5 步，跳回第 2 步后落子，新历史只保留第 0、1、2 步，再追加新的第 3 步，旧第 3、4、5 步被替换。

### 5. 判断赢家

`calculateWinner` 依次检查三行、三列和两条对角线。对于每组索引 `[a, b, c]`，只有 `squares[a]` 非空，且三个格子的值相同，才返回该棋子，否则继续检查，全部不满足时返回 `null`。

`null` 表示当前没有赢家，也可能是棋盘已满但无人获胜；当前函数没有单独返回平局状态。

### 阅读代码时的几个区别

- `useState` 是 React Hook；`handleClick`、`handlePlay`、`jumpTo` 和传给子组件的回调都是普通函数。
- `Board` 使用 props 中的 `squares`，实际保存和更新状态的是 `Game`。子组件通过回调通知父组件更新。
- `squares.slice()` 创建棋盘副本，`history.slice(...)` 配合展开语法创建历史数组，避免修改旧快照，保证历史回溯可用。
- JSX 中的 `onSquareClick={() => handleClick(0)}` 传入函数；写成 `onSquareClick={handleClick(0)}` 会在渲染时立即调用，若触发状态更新，可能导致反复渲染。
