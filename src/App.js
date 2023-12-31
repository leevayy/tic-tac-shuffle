import React, { useState } from "react";

export default function Game() {
	const initialGameState = {
		moveCount: 0,
		status: "Current move: X",
		statusClass: "X",
		finish: false
	};

	const [gameState, setGameState] = useState(initialGameState);

	const width = 3;
	const height = 3;

	const [board, setBoard] = useState(initBoard(width, height));

	function currentMove(moveCount) {
		return moveCount % 2 === 0 ? "X" : "O";
	}

	function handleOnMove() {
		const newMoveCount = gameState.moveCount + 1;
		const result = calculateWinner(board);
		if (result) {
			const emojipool =
				"🥳 🎉 🎊 🎁 🎈 🤠 😍 🤩 🕺 💃 ✌️ 🤘 🤟 👆 👍 🙌 👏 🍰 🎂 🧁".split(
					/\s/g
				);
			const getEmoji = () =>
				emojipool[Math.floor(Math.random() * emojipool.length)];

			setGameState({
				moveCount: newMoveCount,
				statusClass: `win ${result}`,

				// TODO: make random emojis +
				// ! make them fly out
				status: `${getEmoji()} Yoo-hoo "${result}" won!! ${getEmoji()}`,
				finish: true
			});
		} else {
			setGameState({
				moveCount: newMoveCount,
				statusClass: `${currentMove(newMoveCount)}`,
				status: `Current move: ${currentMove(newMoveCount)}`,
				finish: false
			});
		}
	}

	return (
		<div className="game">
			<div className={`status ${gameState.statusClass}`}>
				{gameState.status}
			</div>
			<Board
				currentMove={currentMove(gameState.moveCount)}
				onMove={handleOnMove}
				width={width}
				height={height}
				board={board}
				setBoard={setBoard}
			/>
			{!gameState.finish ? (
				<ShuffleButton
					onMove={handleOnMove}
					board={board}
					setBoard={setBoard}
				/>
			) : (
				<RestartButton
					width={width}
					height={height}
					initialGameState={initialGameState}
					setBoard={setBoard}
					setGameState={setGameState}
				/>
			)}
		</div>
	);
}

function ShuffleButton({ onMove, board, setBoard }) {
	// TODO: fix shuffle to be random across everyting
	// * smth like flatten the array shuffle and then reassemble it
	function shuffle(board) {
		const flatBoard = board.flat();
		let currentIndex = flatBoard.length;
		while (currentIndex !== 0) {
			// Pick a remaining element.
			let randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[flatBoard[currentIndex], flatBoard[randomIndex]] = [
				flatBoard[randomIndex],
				flatBoard[currentIndex]
			];
		}

		const size = board.length;
		const newBoard = [];
		for (let i = 0; i < size; i++) {
			newBoard.push([]);
		}

		let r = 0;
		for (let i = 0; i < flatBoard.length; i++) {
			newBoard[r].push(flatBoard[i]);
			if ((i+1) % size === 0) {
				r++;
			}
		}
		return newBoard;
	}

	function handleShuffle() {
		const newBoard = shuffle(board);

		setBoard(newBoard);
	}

	return (
		<button
			className={"shuffle button"}
			onClick={() => {
				handleShuffle();
				onMove();
			}}
		>
			🔮SHUFFLE🎲
		</button>
	);
}

function RestartButton({
	width,
	height,
	setBoard,
	setGameState,
	initialGameState
}) {
	function handleRestart() {
		setGameState(initialGameState);
		setBoard(initBoard(width, height));
	}

	return (
		<button className="restart button" onClick={handleRestart}>
			☑️RESTART🔁
		</button>
	);
}

function Board({ currentMove, onMove, width, height, board, setBoard }) {
	function handleChangeSquareValue(id) {
		// to identify cell we need to do some math.
		// since each id=y*width+x
		// y=(id-x)//width and x=id%width
		let x = id % width;
		let y = Math.floor((id - x) / width);
		if (board[y][x] !== "" || calculateWinner(board)) {
			return;
		}

		const newBoard = [...board];
		newBoard[y][x] = currentMove;
		onMove();
		setBoard(newBoard);
	}

	return (
		<div className="board">
			{board.map((boardRow, y) => (
				<div className="board-row">
					{boardRow.map((val, x) => {
						let id = y * width + x;
						return (
							<Square
								id={id}
								value={val}
								handleClick={() => handleChangeSquareValue(id)}
							></Square>
						);
					})}
				</div>
			))}
		</div>
	);
}

function Square({ id, value, handleClick }) {
	return (
		<button className={`square ${value}`} onClick={handleClick} id={id}>
			{value}
		</button>
	);
}

function initBoard(width, height) {
	const defaultSquareValue = "";
	const initialBoard = [];
	// filling up 2d array with empty strings
	for (let y = 0; y < height; y++) {
		const row = [];
		for (let x = 0; x < width; x++) {
			row.push(defaultSquareValue);
		}
		initialBoard.push(row);
	}
	return initialBoard;
}

function calculateWinner(board) {
	const checkHorizontal = (board) => {
		for (const row of board) {
			if (!row.includes(undefined) && (new Set(row)).size === 1) {
				return row[0];
			}
		}
	};
	let result;

	// horizontal win
	result = checkHorizontal(board);
	if (result) {
		return result;
	};

	// transpose board and then we check as if it was horizontal
	const transposedBoard = [];
	const size = board.length;
	for (let i = 0; i < size; i++) {
		transposedBoard.push([]);
		for (let j = 0; j < size; j++) {
			transposedBoard[i].push(board[j][i]);
		}
	}
	
	result = checkHorizontal(transposedBoard);
	if (result) {
		return result;
	};

	// express diagonals as horizontal rows and solve as for horizontal
	const diagonals = [[], []];
	let inc = 0;
	let dec = size - 1;
	while (inc < size) {
		diagonals[0].push(board[inc][inc]);
		diagonals[1].push(board[dec][inc]);
		inc++;
		dec--;
	}
	result = checkHorizontal(diagonals);
	if (result) {
		return result;
	}
}
