import { useState } from 'react';

/**
 * function Square(props)收下整个对象，用时写 props.value
 * function Square({value}) 直接把 value 拆出来，用时写 value
 * React 社区里第二种更常见，因为一眼就能看出这个组件需要哪些 props。
 * 如果要接收多个，逗号隔开就行：function Square({value, onClick})。
 * 这里的入参就是调用的属性
 */
function Square({value, onSquareClick}) {  
  return <button className="square" onClick={onSquareClick}>{value}</button>;
}

function Board({xIsNext,squares, onPlay}) {
  /*
  要从多个子组件收集数据，或让两个子组件相互通信，请改为在其父组件中声明共享 state。
  父组件可以通过 props 将该 state 传回给子组件。这使子组件彼此同步并与其父组件保持同步。
  value 存储值，而 setValue 是可用于更改值的函数。
  传递给 useState 的 null 用作这个 state 变量的初始值，因此此处 value 的值开始时等于 null
  Array(9).fill(null) 创建了一个包含九个元素的数组，并将它们中的每一个都设置为 null。
    const [squares, setSquares] = useState(Array(9).fill(null));
  */

  //交替落子，定义 xIsNext 变量来跟踪下一个落子的是 X 还是 O
  //这2个参数可以自己命名
  //const [xIsNext, setXIsNext] = useState(true);

  //访问外部函数Board中的函数和变量，这是js的闭包
  function handleClick(i) {
    //避免重复落子，以及获胜判断
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    // 通过调用 setSquares 来创建 squares 的副本并修改它
    const nextSquares = squares.slice();  
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  /**
   * onSquareClick={handleClick(0)} 是现在立刻就执行 handleClick(0)，然后把它的返回值交给 onSquareClick
      handleClick 在组件渲染时就被调用了handleClick 里面调用了 setState（比如 setSquares(...)），
      就会触发重新渲染 → 渲染时又执行 handleClick → 又 setState → 又渲染……无限循环，React 会直接报错

      现在，我们在 Board 组件中处理 state， Board 父组件将 props 传递给 Square 子组件，以便它们可以正确显示。
      单击 Square 时， Square 子组件现在要求 Board 父组件更新棋盘的 state。
      当 Board 的 state 改变时，Board 组件和每个子 Square 都会自动重新渲染。
      保存 Board 组件中所有方块的 state 将使得它可以确定未来的赢家。

      给子组件传入父组件定义的函数，修改父组件中的状态，传入的父组件定义函数就是Hook即钩子函数
   */
  return (
    <>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)}/>
        <Square value={squares[1]} onSquareClick={() => handleClick(1)}/>
        <Square value={squares[2]} onSquareClick={() => handleClick(2)}/>
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)}/>
        <Square value={squares[4]} onSquareClick={() => handleClick(4)}/>
        <Square value={squares[5]} onSquareClick={() => handleClick(5)}/>
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)}/>
        <Square value={squares[7]} onSquareClick={() => handleClick(7)}/>
        <Square value={squares[8]} onSquareClick={() => handleClick(8)}/>
      </div>
    </>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

//顶级组件来显示过去的着法列表。这就是放置包含整个游戏历史的 history state 的地方。
export default function Game() {
  //当useState的setXXX函数出发重新渲染组件是，组件会重新执行函数体内的代码，
  //初始值不会再次被使用，useState的初始值只在第一次渲染时使用
  // const [xIsNext, setXIsNext] = useState(true);
   
  //([Array(9).fill(null)]
  // history 的初始值是 一个数组，里面装着那个长度为 9 的数组
  const [history, setHistory] = useState([Array(9).fill(null)]);
  // const currentSquares = history[history.length - 1];
  //跟踪用户当前正在查看的步骤
  const [currentMove, setCurrentMove] = useState(0);
 //最后，你将修改 Game 组件以渲染当前选定的着法，而不是始终渲染最后的着法：
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  //Board函数用来更新游戏
  function handlePlay(nextSquares) {
    /**
     * [...history, nextSquares] 创建了一个新数组，其中包含 history 中的所有元素，后跟 nextSquares。
     * （你可以将 ...history 展开语法理解为“枚举 history 中的所有元素”。）
例如，如果 history 是 [[null,null,null], ["X",null,null]]，
nextSquares 是 ["X",null,"O"]，那么新的 [...history, nextSquares] 数组就是 
[[null,null,null], ["X",null,null], ["X",null,"O"]]。
     */
    // setHistory([...history, nextSquares]);

    /**
     * 如果你“回到过去”然后从那一点开始采取新的行动，你只想保持那一点的历史。
     * 不是在 history 中的所有项目（... 扩展语法）之后添加 nextSquares，
     * 而是在 history.slice(0, currentMove + 1) 中的所有项目之后添加它，这样你就只保留旧历史的那部分，
     * 如果是所有项目之后添加，则hui。
每次落子时，你都需要更新 currentMove 以指向最新的历史条目。
     */
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    // setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    // setXIsNext(nextMove % 2 === 0);
  }

  /**
   * 渲染一个按钮的元素列表
   * 将每次的动作，生成一个按钮，点击按钮可以回到对应的历史状态
   * 传递给 map 的函数中遍历 history 数组时，squares 参数遍历 history 的每个元素，move 参数遍历每个数组索引
   * moves是一个数组，里面是每次落子对应的按钮，即元素数组，存<button>元素的数组
   */
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    /**
     * 像 <button> 这样的 React 元素是常规的 JavaScript 对象；你可以在你的应用程序中传递它们。
     * 要在 React 中渲染多个项目，你可以使用 React 元素数组。
你已经有一组 state 为 history 的数组，所以现在你需要将其转换为一组 React 元素。
在 JavaScript 中，要将一个数组转换为另一个数组

重新渲染列表时，React 获取每个列表项的 key 并搜索前一个列表的项以查找匹配的 key。
如果当前列表有一个之前不存在的 key，React 会创建一个组件。
如果当前列表缺少前一个列表中存在的 key，React 会销毁前一个组件。
如果两个 key 匹配，则落子相应的组件。

key 告诉 React 每个组件的身份，这使得 React 可以在重新渲染时保持 state。
如果组件的 key 发生变化，组件将被销毁，新 state 将重新创建。

key 是 React 中一个特殊的保留属性。创建元素时，React 提取 key 属性并将 key 直接存储在返回的元素上。
尽管 key 看起来像是作为 props 传递的，但 React 会自动使用 key 来决定要更新哪些组件。
组件无法询问其父组件指定的 key。

key 不需要是全局唯一的；它们只需要在组件及其同级组件之间是唯一的。
     */
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}