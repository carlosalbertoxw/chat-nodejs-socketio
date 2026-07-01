const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 5000;

// Límites para acotar memoria, red y abuso
const MAX_HISTORY = 100;        // mensajes conservados en memoria
const MAX_TEXT_LENGTH = 500;    // longitud máxima del mensaje
const MAX_NICKNAME_LENGTH = 30; // longitud máxima del nickname
const RATE_LIMIT_MS = 300;      // tiempo mínimo entre mensajes por socket

let nextId = 1;

const messages = [{
	id: nextId++,
	text: 'Bienvenido',
	nickname: 'Bot'
}];

// Devuelve un string válido y recortado, o null si no lo es
function sanitize(value, maxLength) {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (trimmed === '' || trimmed.length > maxLength) return null;
	return trimmed;
}

io.on('connection', (socket) => {
	console.log(`El cliente con ip: ${socket.handshake.address} se ha conectado`);

	// Carga inicial: el historial completo, una sola vez
	socket.emit('messages', messages);

	let lastMessageAt = 0;

	socket.on('add-message', (data) => {
		const now = Date.now();

		// Rate limit: descarta mensajes demasiado seguidos
		if (now - lastMessageAt < RATE_LIMIT_MS) return;

		if (!data || typeof data !== 'object') return;

		const nickname = sanitize(data.nickname, MAX_NICKNAME_LENGTH) || 'Anonimo';
		const text = sanitize(data.text, MAX_TEXT_LENGTH);
		if (!text) return; // vacío, no-string o demasiado largo

		lastMessageAt = now;

		const message = { id: nextId++, nickname, text };
		messages.push(message);
		if (messages.length > MAX_HISTORY) messages.shift();

		// Difunde solo el mensaje nuevo, no todo el historial
		io.emit('new-message', message);
	});
});

app.use(express.static('client'));

server.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
