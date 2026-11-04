const assert = require('node:assert/strict');
const { after, afterEach, before, beforeEach, describe, it, mock } = require('node:test');
const { io: connect } = require('socket.io-client');
const {
	createChatServer,
	MAX_HISTORY,
	MAX_NICKNAME_LENGTH,
	MAX_TEXT_LENGTH,
	RATE_LIMIT_MS
} = require('../server/index');

describe('chat', () => {
	let server;
	let url;
	let clients;

	before(() => {
		mock.method(console, 'log', () => {});
	});

	after(() => {
		mock.restoreAll();
	});

	beforeEach(async () => {
		clients = [];
		server = createChatServer();
		await new Promise((resolve) => server.listen(0, resolve));
		url = `http://localhost:${server.address().port}`;
	});

	afterEach(async () => {
		clients.forEach((client) => client.disconnect());
		server.closeAllConnections();
		await new Promise((resolve) => server.close(resolve));
	});

	// Conecta un cliente y espera el historial inicial
	async function connectClient() {
		const client = connect(url, { forceNew: true });
		clients.push(client);
		const history = await new Promise((resolve) => client.once('messages', resolve));
		return { client, history };
	}

	function send(client, data) {
		return client.timeout(2000).emitWithAck('add-message', data);
	}

	function wait(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	it('envía la bienvenida al conectar', async () => {
		const { history } = await connectClient();
		assert.deepEqual(history, [{ text: 'Bienvenido', nickname: 'Bot' }]);
	});

	it('difunde un mensaje válido a todos los clientes', async () => {
		const { client: sender } = await connectClient();
		const { client: receiver } = await connectClient();
		const received = new Promise((resolve) => receiver.once('new-message', resolve));

		const response = await send(sender, { nickname: ' Ana ', text: ' Hola ' });

		assert.deepEqual(response, { ok: true });
		assert.deepEqual(await received, { nickname: 'Ana', text: 'Hola' });
	});

	it('incluye los mensajes anteriores en el historial', async () => {
		const { client } = await connectClient();
		await send(client, { nickname: 'Ana', text: 'Hola' });

		const { history } = await connectClient();

		assert.deepEqual(history.at(-1), { nickname: 'Ana', text: 'Hola' });
	});

	it('usa Anonimo si el nickname está vacío o falta', async () => {
		const { client } = await connectClient();
		const received = new Promise((resolve) => client.once('new-message', resolve));

		await send(client, { nickname: '   ', text: 'Hola' });

		assert.equal((await received).nickname, 'Anonimo');
	});

	for (const [name, data] of [
		['datos nulos', null],
		['datos que no son objeto', 'hola'],
		['texto vacío', { text: '   ' }],
		['texto que no es string', { text: 42 }],
		['texto demasiado largo', { text: 'a'.repeat(MAX_TEXT_LENGTH + 1) }],
		['nickname demasiado largo', { nickname: 'a'.repeat(MAX_NICKNAME_LENGTH + 1), text: 'Hola' }]
	]) {
		it(`rechaza con un error: ${name}`, async () => {
			const { client } = await connectClient();
			let broadcasts = 0;
			client.on('new-message', () => broadcasts++);

			const response = await send(client, data);

			assert.equal(response.ok, false);
			assert.equal(typeof response.error, 'string');
			assert.equal(broadcasts, 0);
		});
	}

	it('acepta un mensaje de la longitud máxima, aunque sea todo multibyte', async () => {
		const { client } = await connectClient();

		const response = await send(client, { nickname: 'ñ'.repeat(MAX_NICKNAME_LENGTH), text: '€'.repeat(MAX_TEXT_LENGTH) });

		assert.deepEqual(response, { ok: true });
	});

	it('limita la frecuencia de mensajes por conexión', async () => {
		const { client } = await connectClient();

		assert.equal((await send(client, { text: 'uno' })).ok, true);
		assert.equal((await send(client, { text: 'dos' })).ok, false);

		await wait(RATE_LIMIT_MS + 50);

		assert.equal((await send(client, { text: 'tres' })).ok, true);
	});

	it('no falla si el cliente no pide acuse', async () => {
		const { client } = await connectClient();
		const received = new Promise((resolve) => client.once('new-message', resolve));

		client.emit('add-message', { text: 'Hola' });

		assert.equal((await received).text, 'Hola');
	});

	it('desconecta a quien supera el tamaño máximo de datos', async () => {
		const { client } = await connectClient();
		const disconnected = new Promise((resolve) => client.once('disconnect', resolve));

		client.emit('add-message', { text: 'a'.repeat(10000) });

		assert.ok(await disconnected);
	});

	it(`conserva como máximo ${MAX_HISTORY} mensajes`, async (t) => {
		// El reloj simulado avanza en cada llamada para no chocar con el rate limit
		t.mock.method(Date, 'now', (() => {
			let time = 1000000;
			return () => (time += RATE_LIMIT_MS);
		})());

		const { client } = await connectClient();
		for (let i = 1; i <= MAX_HISTORY + 5; i++) {
			await send(client, { text: `mensaje ${i}` });
		}

		const { history } = await connectClient();

		// El historial más la bienvenida, que no ocupa lugar
		assert.equal(history.length, MAX_HISTORY + 1);
		assert.equal(history[1].text, 'mensaje 6');
		assert.equal(history.at(-1).text, `mensaje ${MAX_HISTORY + 5}`);
	});

	it('sirve el cliente sin importar el directorio de arranque', async () => {
		const originalCwd = process.cwd();
		process.chdir(__dirname);
		const otherServer = createChatServer();
		await new Promise((resolve) => otherServer.listen(0, resolve));

		try {
			const response = await fetch(`http://localhost:${otherServer.address().port}/`);
			assert.equal(response.status, 200);
			assert.match(await response.text(), /<title>/);
		} finally {
			process.chdir(originalCwd);
			otherServer.closeAllConnections();
			await new Promise((resolve) => otherServer.close(resolve));
		}
	});

	it('envía las cabeceras de seguridad', async () => {
		const response = await fetch(`${url}/`);

		assert.equal(response.headers.get('x-powered-by'), null);
		assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
		assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
	});
});
