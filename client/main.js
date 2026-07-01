const socket = io();

// Carga inicial: pinta todo el historial de una vez
socket.on('messages', (data) => {
	const divMessages = document.getElementById('messages');
	divMessages.innerHTML = '';
	data.forEach((message) => appendMessage(divMessages, message));
});

// Cada mensaje posterior: solo añade el nuevo nodo
socket.on('new-message', (message) => {
	appendMessage(document.getElementById('messages'), message);
});

function appendMessage(divMessages, message) {
	const wrapper = document.createElement('div');
	wrapper.className = 'message';

	const author = document.createElement('strong');
	author.textContent = message.nickname;

	const text = document.createElement('p');
	text.textContent = message.text;

	wrapper.appendChild(author);
	wrapper.append(' dice:');
	wrapper.appendChild(text);
	divMessages.appendChild(wrapper);

	divMessages.scrollTop = divMessages.scrollHeight;
}

function addMessage() {
	const textInput = document.getElementById('text');
	const nicknameInput = document.getElementById('nickname');
	const text = textInput.value.trim();

	if (text !== '') {
		socket.emit('add-message', {
			nickname: nicknameInput.value,
			text: text
		});
		textInput.value = '';
		return false;
	}
}

function setNickname() {
	const nickname = prompt('Ingresa tu Nickname', 'Anonimo');
	document.getElementById('nickname').value = nickname;
}
