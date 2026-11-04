const MAX_MESSAGES = 100;        // nodos conservados en pantalla, igual que el historial del servidor
const SEND_TIMEOUT_MS = 5000;    // tiempo máximo de espera del acuse del servidor
const NEAR_BOTTOM_PX = 40;       // margen para considerar que se está leyendo lo último

const socket = io();

const divMessages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const nicknameInput = document.getElementById('nickname');
const textInput = document.getElementById('text');
const statusLine = document.getElementById('status');

let sending = false;

// Carga inicial: pinta todo el historial de una vez
socket.on('messages', (messages) => {
	divMessages.replaceChildren();
	messages.forEach(appendMessage);
	scrollToBottom();
});

// Cada mensaje posterior: solo añade el nuevo nodo
socket.on('new-message', appendMessage);

socket.on('connect', () => {
	statusLine.textContent = '';
});

socket.on('disconnect', () => {
	statusLine.textContent = 'Sin conexión. Reintentando...';
});

function appendMessage(message) {
	// Se mide antes de añadir: no mover el scroll si se están leyendo mensajes antiguos
	const distanceToBottom = divMessages.scrollHeight - divMessages.scrollTop - divMessages.clientHeight;

	const wrapper = document.createElement('div');
	wrapper.className = 'message';

	const author = document.createElement('strong');
	author.textContent = message.nickname;

	const text = document.createElement('p');
	text.textContent = message.text;

	wrapper.append(author, ' dice:', text);
	divMessages.append(wrapper);

	while (divMessages.children.length > MAX_MESSAGES) {
		divMessages.firstElementChild.remove();
	}

	if (distanceToBottom < NEAR_BOTTOM_PX) scrollToBottom();
}

function scrollToBottom() {
	divMessages.scrollTop = divMessages.scrollHeight;
}

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const text = textInput.value.trim();
	if (sending || text === '') return;

	sending = true;
	socket.timeout(SEND_TIMEOUT_MS).emit('add-message', { nickname: nicknameInput.value, text }, (err, response) => {
		sending = false;

		if (err) {
			statusLine.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
			return;
		}
		if (!response.ok) {
			statusLine.textContent = response.error;
			return;
		}

		statusLine.textContent = '';
		// El texto solo se borra si el servidor lo aceptó y no se editó mientras tanto
		if (textInput.value.trim() === text) textInput.value = '';
		scrollToBottom();
	});

	textInput.focus();
});

// Enter envía; Shift+Enter inserta un salto de línea
textInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
		event.preventDefault();
		form.requestSubmit();
	}
});
