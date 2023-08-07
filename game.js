#!/usr/bin/env node
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const DIRNAME = "logs";
const FILENAME = "log.txt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, DIRNAME, FILENAME);

const rl = createInterface({ input, output });
let isEnd = false;
const createDir = () => {
	const dir = path.join(__dirname, DIRNAME);
	if (!fs.existsSync(dir)) {
		fs.mkdir(dir, (err) => {
			if (err) console.log("Error");
		});
	}
};
const getRandomNumber = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
const writeLog = (file, data) => {
	fs.appendFile(file, data, (err) => {
		if (err) console.log(err);
	});
};

const theGame = async (secret, file) => {
	const name = await rl.question(`Как вас зовут? `);
	const answer = await rl.question(
		`Я загадал случайное число (1 или 2), угадай его! Введите число: `
	);
	const result = +answer === +secret;
	const data = `${Date.now()} ${name} ${result};`;
	writeLog(file, data);
	console.log(result ? `Вы угадали!` : `Вы не угадали!`);
	const next = await rl.question(`Хотите продолжить игру? (y/n): `);
	if (next.toLowerCase() === "y") {
		theGame(secret, file);
	} else {
		console.log("Игра окончена");
		const logs = await rl.question(
			`Хотите посмотреть статистику игры? (y/n): `
		);
		if (logs.toLowerCase() === "y") {
			logAnalizator(file);
			rl.close();
			isEnd = true;
		}
		rl.close();
		isEnd = true;
	}
};
const createGame = async (one, two) => {
	createDir();
	while (!isEnd) {
		const secret = getRandomNumber(one, two);
		await theGame(secret, file);
	}
};

const gamesStatuses = {
	win: "Угадал",
	lose: "Не угадал",
};

const makeLogsTempArray = (data) => {
	let arr = data.split(";");
	arr.length = arr.length - 1;
	return arr.map((el) => {
		const log = el.split(" ");
		return {
			date: new Date(+log[0].trim()).toLocaleString("ru-RU"),
			name: log[1].trim(),
			result: log[2] === "true" ? gamesStatuses.win : gamesStatuses.lose,
		};
	});
};

const gamesCount = (data, opt) => {
	return data.filter((game) => game.result === opt).length;
};

const logTemplateView = (data) => {
	const all = data.length;
	const win = gamesCount(data, gamesStatuses.win);
	const lose = gamesCount(data, gamesStatuses.lose);
	const winToAllPercent = (win * 100) / all;
	console.log(`
общее количество партий ${all} ☑️
количество выигранных ${win} 🏆
количество програнных ${lose} 👎
процентное соотношение выигранных партий ${winToAllPercent}% 💯
	`);
};

const logAnalizator = (file) => {
	fs.readFile(file, "utf8", async (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		const tempArrayLogs = makeLogsTempArray(data);
		logTemplateView(tempArrayLogs);
	});
};

createGame(1, 2);
