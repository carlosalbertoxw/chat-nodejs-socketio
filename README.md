# Chat-NodeJS-SocketIO

## Overview
This repository contains a simple example of a real-time chat application built using Node.js, Express, and Socket.IO.

## Motivation
I created this project out of curiosity and for fun, as a way to explore the capabilities of Node.js, Express, and Socket.IO in building a chat application.

## Technologies
- Node.js
- Express
- Socket.IO

## Getting Started

### Prerequisites
To run the project, you'll need Node.js 22 or newer and npm installed on your machine.

### Installation
- Clone the repository or download the source code.
- Navigate to the project directory in your terminal.
- Run the following command to install the required dependencies:
```
npm install
```

### Running the Server
- Start the server by running the following command:
```
npm start
```
- Open your browser and visit the following URL to access the chat interface: http://localhost:5000/
- Enter a nickname (optional) and start chatting. Press Enter to send and Shift+Enter for a new line.
- For a better demonstration of the functionality, open the URL in different browsers or browser tabs to simulate multiple users.

To use another port, set the `PORT` environment variable.

### Scripts
| Command | Description |
|---------|-------------|
| `npm start` | Starts the server |
| `npm run dev` | Starts the server and restarts it when files change |
| `npm test` | Runs the integration tests |
| `npm run lint` | Checks the code with ESLint |

## Project Structure
```
client/   Static page served to the browser (HTML, CSS and JavaScript)
server/   Express and Socket.IO server; keeps the message history in memory
test/     Integration tests
```

## Socket.IO Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `messages` | server → client | Full history, on connection |
| `add-message` | client → server | `{ nickname, text }`; the acknowledgement returns `{ ok: true }` or `{ ok: false, error }` |
| `new-message` | server → all clients | The accepted message: `{ nickname, text }` |

## License
[ISC](LICENSE)

Enjoy your real-time chat experience!
