const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Límites para acotar memoria, red y abuso
const MAX_HISTORY = 100;         // mensajes conservados en memoria
const MAX_TEXT_LENGTH = 500;     // longitud máxima del mensaje
const MAX_NICKNAME_LENGTH = 30;  // longitud máxima del nickname
const RATE_LIMIT_MS = 300;       // tiempo mínimo entre mensajes por socket
const MAX_PAYLOAD_BYTES = 4096;  // cabe el mensaje más largo aunque sea todo multibyte

const DEFAULT_NICKNAME = 'Anonimo';
const WELCOME_MESSAGE = { text: 'Bienvenido', nickname: 'Bot' };

// Sin 'unsafe-inline': todo el JS y el CSS del cliente se sirven como archivos
const CONTENT_SECURITY_POLICY = "default-src 'self'; base-uri 'none'; frame-ancestors 'none'";

function cleanString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

// Devuelve el mensaje listo para difundir, o { error } si no es válido
function parseMessage(data) {
	if (!data || typeof data !== 'object') return { error: 'Mensaje no válido' };

	const nickname = cleanString(data.nickname) || DEFAULT_NICKNAME;
	const text = cleanString(data.text);

	if (nickname.length > MAX_NICKNAME_LENGTH) {
		return { error: `El nickname admite hasta ${MAX_NICKNAME_LENGTH} caracteres` };
	}
	if (text === '') return { error: 'Escribe un mensaje' };
	if (text.length > MAX_TEXT_LENGTH) {
		return { error: `El mensaje admite hasta ${MAX_TEXT_LENGTH} caracteres` };
	}

	return { message: { nickname, text } };
}

function createChatServer() {
	const app = express();
	app.disable('x-powered-by');
	app.use((req, res, next) => {
		res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('Referrer-Policy', 'no-referrer');
		next();
	});
	app.use(express.static(path.join(__dirname, '..', 'client')));

	const server = http.createServer(app);
	const io = new Server(server, { maxHttpBufferSize: MAX_PAYLOAD_BYTES });

	const messages = [];

	io.on('connection', (socket) => {
		console.log(`Cliente conectado: ${socket.id}`);

		// Carga inicial: el historial completo, una sola vez
		socket.emit('messages', [WELCOME_MESSAGE, ...messages]);

		let lastMessageAt = 0;

		socket.on('add-message', (data, ack) => {
			// El acuse es opcional: un cliente puede no enviarlo
			const reply = typeof ack === 'function' ? ack : () => {};
			const now = Date.now();

			if (now - lastMessageAt < RATE_LIMIT_MS) {
				return reply({ ok: false, error: 'Espera un momento antes de enviar otro mensaje' });
			}

			const { message, error } = parseMessage(data);
			if (error) return reply({ ok: false, error });

			lastMessageAt = now;

			messages.push(message);
			if (messages.length > MAX_HISTORY) messages.shift();

			// Difunde solo el mensaje nuevo, no todo el historial
			io.emit('new-message', message);
			reply({ ok: true });
		});
	});

	return server;
}

if (require.main === module) {
	createChatServer().listen(PORT, () => {
		console.log(`Servidor escuchando en http://localhost:${PORT}`);
	});
}

module.exports = { createChatServer, MAX_HISTORY, MAX_NICKNAME_LENGTH, MAX_TEXT_LENGTH, RATE_LIMIT_MS };
