# Auditoría del proyecto: chat-nodejs-socketio

**Fecha:** 2026-11-04 · **Commit auditado:** `cf1fc71` (master) · **Auditor:** Claude (skill auditoria-proyecto-software)

## Estado tras las correcciones (2026-11-04)

Correcciones aplicadas sobre `cf1fc71`, todavía sin commit. Las secciones 1 a 6 conservan el informe original como referencia.

**Calificación actualizada:** 78 % — Aceptable con mejoras (antes 59 %)
**Controles evaluables:** 27 cumplen · 6 parciales · 0 sin cumplir

| Hallazgo | Estado | Resultado |
|----------|--------|-----------|
| H-01 Vulnerabilidades | ⚠️ Persistente en parte | 0 en producción. Quedan 5 moderadas solo de desarrollo, por `minimatch` dentro de ESLint, y `--force` bajaría ESLint a la 4.0.0. Los PR #7 a #11 siguen abiertos hasta subir los cambios a `master`. |
| H-02 Mensajes perdidos | ✅ Resuelto | Acuse del servidor, `maxlength` y error visible; el texto se conserva si se rechaza |
| H-03 `nodemon` | ✅ Resuelto | `npm start` usa `node` y `npm run dev` usa `node --watch` |
| H-04 Pruebas | ✅ Resuelto | `createChatServer` y 17 pruebas de integración con `node:test` |
| H-05 CI y linter | ⚠️ Pendiente de ejecutar | Workflow y ESLint añadidos; el workflow no se ha ejecutado en GitHub |
| H-06 Ruta de estáticos | ✅ Resuelto | Usa `__dirname`, comprobado arrancando desde `server/` |
| H-07 Frontend | ✅ Resuelto | Formulario, nickname visible, `defer`, CSS aparte y varias líneas con Shift+Enter |
| H-08 Restos | ✅ Resuelto | Sin `id` ni `nextId`; bienvenida fuera del historial; `main` corregido; `new Server()` |
| H-09 Límites de abuso | ⚠️ Aceptado en parte | `maxHttpBufferSize` de 4 KB. Sin límite por IP, por decisión (solo local) |
| H-10 DOM y scroll | ✅ Resuelto | Máximo 100 nodos; el scroll no se mueve si estás leyendo arriba |
| H-11 Endurecimiento web | ⚠️ Aceptado en parte | CSP, `nosniff`, `Referrer-Policy`, sin `X-Powered-By` ni IP en logs. Sin validar origen de WebSocket, por decisión (solo local) |
| H-12 Documentación y licencia | ⚠️ Aceptado en parte | `LICENSE` ISC y README ampliado; sin licencias GPL/AGPL entre los paquetes instalados (solo `xmlhttprequest-ssl`, de desarrollo, no declara licencia). Sin reescribir commits antiguos ni proteger `master` |

**Cambio de dependencias:** Express pasó a la 5.3.0. Los paquetes del lockfile subieron de 121 a 166: producción bajó de 90 a 86, y desarrollo subió de 31 a 80 por ESLint.

**Verificación:**
- `npm test` (17 de 17) y `npm run lint` pasan.
- `npm audit --omit=dev` no reporta vulnerabilidades.
- En el navegador se comprobó: envío con Enter, varias líneas, errores visibles, conexión por WebSocket con la CSP activa, servidor caído, reconexión y mensajes entre dos pestañas.
- No se probó en otros navegadores ni con usuarios reales.

| # | Área | Antes | Ahora |
|---|------|------:|------:|
| 01 | Fundamentos del proyecto | 50 % | 50 % |
| 02 | Diseño y arquitectura | 67 % | 100 % |
| 03 | Documentación | 63 % | 100 % |
| 04 | Pruebas y calidad | 0 % | 100 % |
| 05 | Automatización y despliegue | 0 % | 50 % |
| 07 | Secretos y configuración | 100 % | 100 % |
| 09 | Base de datos y autorización | 100 % | 100 % |
| 10 | Validación y protección de datos | 100 % | 100 % |
| 11 | Archivos y APIs | 75 % | 75 % |
| 12 | Seguridad web | 33 % | 83 % |
| 13 | Dependencias y vigilancia | 67 % | 83 % |
| 14 | Cumplimiento y aspectos legales | 50 % | 100 % |

## 1. Resumen ejecutivo

Chat en tiempo real de unas 120 líneas de JavaScript (Node.js, Express 4 y Socket.IO 4, con cliente HTML sin framework). Guarda el historial solo en memoria y no tiene cuentas, base de datos ni servicios externos. Se evaluó como **ejercicio de aprendizaje sin usuarios reales**, así que los controles de operación en producción se marcaron como No aplica.

El código ya está bien encaminado: es seguro frente a XSS, valida en el servidor y limita el historial. Lo más útil ahora es actualizar dependencias, corregir la pérdida silenciosa de mensajes, quitar `nodemon` y añadir unas pocas pruebas. No hace falta más arquitectura.

**Calificación global:** 59 % — Requiere atención
**Hallazgos:** 0 críticos · 0 altos · 4 medios · 8 bajos · 1 informativo
**Controles no verificables desde el código:** 0 de 79 (46 marcados como No aplica por ser un ejercicio; ver sección 4)

> La etiqueta sale de una escala genérica para proyectos. El 59 % se debe sobre todo a que no hay pruebas ni CI (dos áreas con 0 %), no a defectos graves del código.

**Prioridades principales**
1. **H-01** · 8 vulnerabilidades conocidas y 5 PR de Dependabot sin atender. Se resuelve casi todo con un comando.
2. **H-02** · Los mensajes rechazados por el servidor se pierden sin aviso: el cliente ya borró el texto.
3. **H-03** · `npm start` depende de `nodemon`, una dependencia de desarrollo que Node ya no necesita.
4. **H-04** · No hay pruebas, y el servidor no se puede importar sin que se ponga a escuchar.

## 2. Resultados por área

| # | Área | Cumple | Parcial | No cumple | N/A | No verif. | Puntaje |
|---|------|-------:|--------:|----------:|----:|----------:|--------:|
| 01 | Fundamentos del proyecto | 0 | 2 | 0 | 1 | 0 | 50 % |
| 02 | Diseño y arquitectura | 2 | 4 | 0 | 5 | 0 | 67 % |
| 03 | Documentación | 2 | 1 | 1 | 5 | 0 | 63 % |
| 04 | Pruebas y calidad | 0 | 0 | 3 | 1 | 0 | 0 % |
| 05 | Automatización y despliegue | 0 | 0 | 1 | 3 | 0 | 0 % |
| 06 | Observabilidad y operación | 0 | 0 | 0 | 6 | 0 | — |
| 07 | Secretos y configuración | 3 | 0 | 0 | 0 | 0 | 100 % |
| 08 | Autenticación y sesiones | 0 | 0 | 0 | 6 | 0 | — |
| 09 | Base de datos y autorización | 1 | 0 | 0 | 4 | 0 | 100 % |
| 10 | Validación y protección de datos | 3 | 0 | 0 | 3 | 0 | 100 % |
| 11 | Archivos y APIs | 1 | 1 | 0 | 2 | 0 | 75 % |
| 12 | Seguridad web | 0 | 2 | 1 | 2 | 0 | 33 % |
| 13 | Dependencias y vigilancia | 1 | 2 | 0 | 5 | 0 | 67 % |
| 14 | Cumplimiento y aspectos legales | 0 | 2 | 0 | 3 | 0 | 50 % |

<details>
<summary>Detalle de estado por control</summary>

| Control | Estado | Nota breve |
|---------|--------|------------|
| FUN-01 | ⚠️ Parcial | Commits recientes claros; 5 antiguos dicen solo "Actualización" |
| FUN-02 | ⚠️ Parcial | Se usan PR, pero `6871b7f` entró directo y `master` no tiene protección (confirmado con la API de GitHub) |
| FUN-03 | ➖ N/A | Ejercicio local con Node puro; `engines` basta (H-12) |
| ARQ-01 | ➖ N/A | Ejercicio sin objetivos de servicio |
| ARQ-02 | ➖ N/A | Una sola persona, sin cambios de diseño que revisar |
| ARQ-03 | ➖ N/A | Sin datos ni accesos que proteger |
| ARQ-04 | ⚠️ Parcial | `nodemon` ya no hace falta (H-03) |
| ARQ-05 | ✅ Cumple | Un solo proceso y dos archivos de código |
| ARQ-06 | ⚠️ Parcial | `server/index.js` mezcla arranque, estado y reglas (H-04) |
| ARQ-07 | ✅ Cumple | Sin patrones innecesarios |
| ARQ-08 | ⚠️ Parcial | Código pequeño y legible, con restos menores (H-08) |
| ARQ-09 | ⚠️ Parcial | Servidor bien acotado; el DOM del cliente crece sin límite (H-10) |
| ARQ-10 | ➖ N/A | Sin integraciones externas |
| ARQ-11 | ➖ N/A | El único consumidor vive en este repositorio |
| DOC-01 | ✅ Cumple | El README explica qué es y por qué existe |
| DOC-02 | ⚠️ Parcial | Sin versión de Node ni mención de `PORT` (H-12) |
| DOC-03 | ❌ No cumple | Sin descripción de estructura ni de eventos (H-12) |
| DOC-04 | ➖ N/A | Sin decisiones de peso que registrar |
| DOC-05 | ➖ N/A | Sin API para terceros; los eventos se cubren en DOC-03 |
| DOC-06 | ➖ N/A | Un solo contribuyente |
| DOC-07 | ➖ N/A | Sin operación en producción |
| DOC-08 | ➖ N/A | Sin versiones publicadas ni consumidores |
| DOC-09 | ✅ Cumple | Documentación en el repo; los comentarios explican el porqué |
| PRU-01 | ❌ No cumple | Sin pruebas (H-04) |
| PRU-02 | ❌ No cumple | Sin pruebas (H-04) |
| PRU-03 | ➖ N/A | Sin flujos críticos; una prueba de integración basta |
| PRU-04 | ❌ No cumple | Sin linter ni formateador (H-05) |
| CI-01 | ❌ No cumple | Sin pipeline (H-05) |
| CI-02 | ➖ N/A | Depende de que exista CI-01 |
| CI-03 | ➖ N/A | Sin base de datos |
| CI-04 | ➖ N/A | Sin despliegue |
| OBS-01 a 06 | ➖ N/A | Sin despliegue y sin datos persistentes |
| SEC-01 | ✅ Cumple | El inventario no halló secretos; la app no usa ninguno |
| SEC-02 | ✅ Cumple | El inventario no halló archivos sensibles en el historial |
| SEC-03 | ✅ Cumple | La única configuración (`PORT`) viene del entorno |
| AUT-01 a 06 | ➖ N/A | Sin autenticación, por diseño |
| BD-01, 02, 03, 05 | ➖ N/A | Sin base de datos ni operaciones sensibles |
| BD-04 | ✅ Cumple | El mensaje se arma campo por campo (`server/index.js:54`) |
| VAL-01 | ✅ Cumple | Tipo y longitud validados en el servidor (`server/index.js:25-30`) |
| VAL-02 | ✅ Cumple | Usa `textContent`; el `innerHTML` de `client/main.js:6` es una cadena vacía fija |
| VAL-03, 04, 05 | ➖ N/A | Sin SQL, peticiones salientes ni datos en disco |
| VAL-06 | ✅ Cumple | Máximo 100 mensajes en memoria y nada persistente |
| API-01, 02 | ➖ N/A | Sin subida de archivos |
| API-03 | ✅ Cumple | Solo se envía `id`, `nickname` y `text` |
| API-04 | ⚠️ Parcial | Rate limit por socket fácil de evadir (H-09) |
| WEB-01 | ➖ N/A | Solo local; HTTPS correspondería al despliegue |
| WEB-02 | ❌ No cumple | Sin cabeceras de seguridad (H-11) |
| WEB-03 | ⚠️ Parcial | CORS cerrado por defecto, pero no aplica a WebSocket (H-11) |
| WEB-04 | ➖ N/A | Sin cookies |
| WEB-05 | ⚠️ Parcial | Registra la IP de cada cliente (H-11) |
| DEP-01 | ⚠️ Parcial | Hay alertas, pero siguen sin corregirse (H-01) |
| DEP-02 | ✅ Cumple | `package-lock.json` versionado |
| DEP-03 | ⚠️ Parcial | PR de Dependabot acumulados; SBOM innecesario aquí (H-01) |
| DEP-04 | ➖ N/A | Dependabot es proporcional para este tamaño |
| DEP-05 a 08 | ➖ N/A | Sin cuentas, equipo ni datos que vigilar |
| LEG-01 | ⚠️ Parcial | Sin archivo `LICENSE`; 33 paquetes sin licencia en el lockfile (H-12) |
| LEG-02 a 04 | ➖ N/A | Sin datos personales persistentes ni terceros |
| LEG-05 | ⚠️ Parcial | Declara ISC, pero sin `LICENSE` (H-12) |

</details>

## 3. Hallazgos

Las severidades ya están ajustadas al contexto de ejercicio. Si lo despliegas en público, H-01 sube a Alta.

### [H-01] Vulnerabilidades conocidas y PR de Dependabot sin atender — 🟡 Media
- **Control:** DEP-01, DEP-03
- **Evidencia:** `npm audit --package-lock-only` reporta 8 vulnerabilidades (1 crítica, 4 altas, 3 moderadas); 5 de ellas están en producción. GitHub tiene 6 alertas abiertas y 5 PR abiertos desde agosto: [#7](https://github.com/carlosalbertoxw/chat-nodejs-socketio/pull/7), [#8](https://github.com/carlosalbertoxw/chat-nodejs-socketio/pull/8), [#9](https://github.com/carlosalbertoxw/chat-nodejs-socketio/pull/9), [#10](https://github.com/carlosalbertoxw/chat-nodejs-socketio/pull/10) y [#11](https://github.com/carlosalbertoxw/chat-nodejs-socketio/pull/11).

| Paquete | Severidad npm | ¿Afecta a este proyecto? |
|---------|---------------|--------------------------|
| `socket.io-parser` < 4.2.7 | Alta | **Probablemente sí:** procesa los paquetes que llegan por red |
| `engine.io` < 6.6.10 | Alta | **Probablemente sí:** atiende las conexiones en `/socket.io` |
| `proxy-addr` < 2.0.8 | Crítica | No parece alcanzable: exige `trust proxy`, que el proyecto no configura |
| `body-parser` < 1.20.9 | Alta | No parece alcanzable: la app no usa parsers de cuerpo |
| `qs` ≤ 6.16.0 | Moderada | Sin confirmar: Express 4 lo usa para leer la query string |
| `brace-expansion`, `minimatch`, `nodemon` | Alta/Moderada | Solo en desarrollo; desaparecen con H-03 |

- **Riesgo:** en un servidor público, alguien podría tumbarlo con una denegación de servicio. En local el impacto es nulo. La severidad baja de Alta a Media por eso, y la crítica de `proxy-addr` no se trata como crítica porque su condición no se da aquí. No se probó ninguna explotación.
- **Recomendación:** aplica H-03 primero y luego ejecuta `npm audit fix`. **No uses `--force`:** propone bajar `nodemon` a la 1.0.2. Después, los 5 PR deberían quedar obsoletos; ciérralos si Dependabot no lo hace.
- **Esfuerzo estimado:** Bajo

### [H-02] Los mensajes rechazados se pierden en silencio — 🟡 Media
- **Control:** ARQ-08 (error funcional)
- **Evidencia:** el cliente vacía el campo justo después de enviar (`client/main.js:39-43`), y el servidor descarta sin responder lo que llega muy seguido (`server/index.js:44`) o supera los 500 caracteres (`server/index.js:50`). El `textarea` no tiene `maxlength` (`client/index.html:40`). Un nickname de más de 30 caracteres también se cambia a "Anonimo" sin aviso (`server/index.js:48`).
- **Riesgo:** si pegas un texto largo, desaparece del campo y nunca llega al chat, sin ningún error visible.
- **Recomendación:** añade `maxlength` en los campos y usa un acuse de Socket.IO. El texto se borra solo si el servidor lo aceptó:

```js
// server/index.js
socket.on('add-message', (data, ack) => {
	const reply = typeof ack === 'function' ? ack : () => {};
	// ... en cada rechazo:  return reply({ ok: false, error: 'Mensaje no válido' });
	// ... al aceptarlo:     reply({ ok: true });
});

// client/main.js
socket.emit('add-message', { nickname, text }, (res) => {
	if (res.ok) textInput.value = '';
	else alert(res.error);
});
```
- **Esfuerzo estimado:** Bajo

### [H-03] `npm start` depende de `nodemon`, que ya no hace falta — 🟡 Media
- **Control:** ARQ-04
- **Evidencia:** `package.json:7` ejecuta `nodemon`, declarado como dependencia de desarrollo (`package.json:25`). Por eso `npm start` no funcionaría tras `npm install --omit=dev`. `nodemon` y sus dependencias son 31 de los 121 paquetes del lockfile e incluyen las vulnerabilidades de desarrollo de H-01.
- **Riesgo:** el arranque "de producción" depende de una herramienta de desarrollo, y se mantienen paquetes sin necesidad.
- **Recomendación:** quita `nodemon` y usa el modo de observación de Node:

```json
"scripts": {
  "start": "node server/index.js",
  "dev": "node --watch server/index.js"
},
"engines": { "node": ">=22" }
```
- **Esfuerzo estimado:** Bajo

### [H-04] Sin pruebas, y con un servidor difícil de probar — 🟡 Media
- **Control:** PRU-01, PRU-02, ARQ-06
- **Evidencia:** no hay archivos de prueba y `package.json:8` conserva el script de ejemplo que siempre falla. `server/index.js:65` se pone a escuchar al importarse, y el historial es una variable global del módulo (`server/index.js:18`).
- **Riesgo:** los límites y validaciones, que son la parte más delicada, pueden romperse sin que nadie lo note.
- **Recomendación:** envuelve el servidor en una función y pruébalo con `node:test` y `socket.io-client`, sin añadir un framework de pruebas:

```js
function createChatServer() { /* app, io, messages, handlers */ return server; }

if (require.main === module) {
	createChatServer().listen(PORT, () => console.log(`...`));
}
module.exports = { createChatServer };
```

Con `"test": "node --test"`, cubre: historial al conectar, difusión a otros clientes, rechazo de vacíos y de largos, nickname por defecto, rate limit y tope de 100 mensajes.
- **Esfuerzo estimado:** Medio

### [H-05] Sin CI ni linter — 🔵 Baja
- **Control:** CI-01, PRU-04
- **Evidencia:** no existe `.github/workflows/` ni configuración de linter o formateador.
- **Riesgo:** la severidad por defecto de CI-01 es Alta, pero se ajusta a Baja porque no hay despliegue ni equipo.
- **Recomendación:** cuando existan pruebas (H-04), añade un workflow con `npm ci`, `npm test` y `npm audit --omit=dev --audit-level=high`. ESLint es opcional, aunque buen ejercicio.
- **Esfuerzo estimado:** Bajo

### [H-06] Los archivos estáticos dependen del directorio de ejecución — 🔵 Baja
- **Control:** ARQ-08
- **Evidencia:** `express.static('client')` en `server/index.js:63` usa una ruta relativa al directorio actual.
- **Riesgo:** si se arranca con `cd server && node index.js`, Socket.IO funciona pero la página da 404.
- **Recomendación:** usa `express.static(path.join(__dirname, '..', 'client'))`.
- **Esfuerzo estimado:** Bajo

### [H-07] El frontend se simplifica usando un formulario — 🔵 Baja
- **Control:** ARQ-08, WEB-02
- **Evidencia:**
  - `client/index.html:41`: botón `submit` sin `<form>`, de modo que Enter no envía.
  - `client/main.js:44`: `return false` no tiene efecto, porque `onclick="addMessage();"` no devuelve ese valor.
  - `client/index.html:35,39` y `client/main.js:48-51`: `prompt()` bloquea la página y necesita un campo oculto.
  - `client/index.html:7-8`: los scripts van en `<head>` sin `defer`. Si el historial llegara antes de crearse `#messages`, `client/main.js:6` fallaría. Es poco probable, pero posible.
  - `client/index.html:4`: `charset="utf8"` funciona, aunque lo correcto es `utf-8`.
  - `client/index.html:29-32`: el `max-width: 405px` compensa el borde; `box-sizing: border-box` lo evita.
- **Riesgo:** peor experiencia y más código del necesario.
- **Recomendación:** usa un `<form>` con nickname visible y scripts con `defer`. Esto elimina `setNickname`, el campo oculto y los manejadores en línea, y Enter empieza a enviar:

```html
<form id="chat-form">
	<input id="nickname" maxlength="30" placeholder="Nickname" aria-label="Nickname">
	<input id="text" maxlength="500" placeholder="Mensaje..." aria-label="Mensaje" required autocomplete="off">
	<button>Enviar</button>
</form>
```
- **Esfuerzo estimado:** Bajo

### [H-08] Restos que se pueden borrar — 🔵 Baja
- **Control:** ARQ-08
- **Evidencia y recomendación:**
  - **`id` sin uso:** el servidor lo genera (`server/index.js:16,19,54`), pero el cliente nunca lo lee. Elimínalo junto con `nextId`.
  - **Bienvenida en el historial:** "Bienvenido" ocupa un lugar y desaparece tras 100 mensajes (`server/index.js:18-22,56`). Muéstrala en el cliente o emítela al conectar, sin guardarla.
  - **Nombre engañoso:** `sanitize` no limpia, sino que valida y recorta (`server/index.js:25`). Un nombre más claro sería `cleanString`.
  - **`main` incorrecto:** apunta a `index.js`, que no existe en la raíz (`package.json:5`). Cámbialo a `server/index.js` o bórralo.
  - **Forma antigua de crear `io`:** `require('socket.io')(server)` (`server/index.js:6`) funciona, pero la documentación actual usa `new Server(server)`.
- **Riesgo:** ninguno inmediato; solo es ruido al leer el código.
- **Esfuerzo estimado:** Bajo

### [H-09] Límites de abuso fáciles de evadir — 🔵 Baja
- **Control:** API-04
- **Evidencia:** `lastMessageAt` vive en cada conexión (`server/index.js:38`), así que reconectar lo reinicia. No se limitan las conexiones por IP. Se aceptan mensajes de 500 caracteres, pero no se configura `maxHttpBufferSize`, cuyo valor por defecto es 1 MB.
- **Riesgo:** una persona con un script podría saturar el chat. Para un ejercicio es aceptable.
- **Recomendación:** el cambio barato es `new Server(server, { maxHttpBufferSize: 4096 })`. Un límite por IP solo tiene sentido si lo publicas.
- **Esfuerzo estimado:** Bajo

### [H-10] El DOM del cliente crece sin límite y el scroll interrumpe la lectura — 🔵 Baja
- **Control:** ARQ-09
- **Evidencia:** el servidor guarda 100 mensajes, pero el cliente acumula todos los que recibe (`client/main.js:28`). Además, baja el scroll con cada mensaje aunque estés leyendo arriba (`client/main.js:30`).
- **Riesgo:** una pestaña abierta mucho tiempo acumula nodos, y es molesto leer mensajes antiguos en un chat activo.
- **Recomendación:** elimina el primer hijo al superar 100 mensajes y haz scroll solo si el usuario ya estaba cerca del final.
- **Esfuerzo estimado:** Bajo

### [H-11] Endurecimiento web opcional — 🔵 Baja
- **Control:** WEB-02, WEB-03, WEB-05
- **Evidencia:** no hay cabeceras de seguridad y Express anuncia `X-Powered-By`. El CORS por defecto de Socket.IO no restringe WebSocket, por lo que otra web podría conectarse. `server/index.js:33` registra la IP de cada cliente.
- **Riesgo:** bajo, porque no hay sesiones ni datos privados. Otra web podría leer y escribir en el chat, igual que cualquier visitante.
- **Recomendación:** añade `app.disable('x-powered-by')` y quita la IP del log. Si lo publicas, valida el origen con `allowRequest` y añade una CSP, que es sencilla una vez hecho H-07 y sacado el CSS a un archivo.
- **Esfuerzo estimado:** Bajo

### [H-12] Documentación, licencia e higiene del repositorio — 🔵 Baja
- **Control:** DOC-02, DOC-03, LEG-01, LEG-05, FUN-01, FUN-02
- **Evidencia:** `package.json:15` declara ISC, pero no existe `LICENSE`. El README no indica versión de Node ni la variable `PORT`, y tampoco describe la estructura ni los eventos. 33 de los 121 paquetes no tienen licencia en el lockfile, y entre los que sí la tienen no aparece GPL ni AGPL. Hay 5 commits antiguos con el mensaje "Actualización", y `master` no tiene protección.
- **Riesgo:** sin `LICENSE`, quien encuentre el repositorio no tiene claro qué puede hacer con el código.
- **Recomendación:** añade `LICENSE` y, en el README, la versión de Node, `PORT` y una tabla corta:

| Evento | Dirección | Contenido |
|--------|-----------|-----------|
| `messages` | servidor → cliente | Historial completo al conectar |
| `add-message` | cliente → servidor | `{ nickname, text }` |
| `new-message` | servidor → todos | Mensaje aceptado |

No vale la pena reescribir el historial antiguo ni proteger `master` si trabajas solo.
- **Esfuerzo estimado:** Bajo

### [H-13] Lo que está bien y lo que no conviene añadir — ⚪ Informativa
- **Control:** ARQ-05, VAL-01, VAL-02
- **Bien resuelto:**
  - `textContent` evita XSS (`client/main.js:20,23`).
  - El servidor no confía en el cliente y comprueba `data` antes de leerlo, lo que evita un fallo con `null` (`server/index.js:46`).
  - Se difunde solo el mensaje nuevo (`server/index.js:59`).
  - El historial se repinta bien al reconectar (`client/main.js:6`).
- **No hace falta:**
  - **Optimizar `messages.shift()`:** es O(n), pero con n = 100 el costo es irrelevante.
  - **Añadir Docker, base de datos, Redis, TypeScript o helmet:** resolverían problemas que este proyecto no tiene, salvo que quieras practicarlos.
  - **Quitar Express:** solo sirve estáticos, pero reemplazarlo añadiría código propio menos probado. Pasar a Express 5 es opcional.
- **Limitación aceptable:** cualquiera puede usar el nickname "Bot" o el de otra persona. Evitarlo requeriría identidad, fuera del alcance de este ejercicio.

## 4. Preguntas para el equipo

La clasificación de 46 controles como No aplica parte de estas suposiciones:

| Control | Pregunta |
|---------|----------|
| OBS, WEB-01, CI-04, DEP-01 | ¿Está o estará desplegado en internet? Si es así, H-01 sube a Alta y se deben evaluar HTTPS, apagado ordenado y logs. |
| LEG-01, LEG-05 | ¿Quieres que otras personas puedan reutilizar el código? Eso define si ISC es la licencia que buscas. |

## 5. Plan de remediación

No hay hallazgos críticos ni altos. Este orden da más beneficio con menos trabajo:

**Inmediato (unos minutos):**
1. H-03: quitar `nodemon` y actualizar scripts.
2. H-01: ejecutar `npm audit fix`, sin `--force`, y cerrar los PR obsoletos.
3. H-06: corregir la ruta de los estáticos.

**Corto plazo (una sesión):**
4. H-07 y H-02: cambiar a formulario, añadir `maxlength` y acuses.
5. H-08: borrar restos.
6. H-04: separar `createChatServer` y añadir pruebas con `node:test`.

**Si quieres seguir practicando:**
7. H-05: workflow de CI.
8. H-10, H-09 y H-11: mejoras de cliente y límites.
9. H-12: `LICENSE` y README.

## 6. Alcance y limitaciones

- **Revisado por completo:** `server/index.js`, `client/main.js`, `client/index.html`, `package.json`, `README.md` y `.gitignore`. El `package-lock.json` se analizó con herramientas.
- **La aplicación no se ejecutó.** No se instalaron dependencias, así que los comportamientos descritos (H-02, H-06, H-07) salen de leer el código, y los fragmentos propuestos no se han probado.
- **Sin confirmar:** que `npm audit fix` deje el resultado en cero, porque solo se ejecutó en simulación. Tampoco se probó la explotación de ninguna vulnerabilidad; "alcanzable" significa que el código pasa por ese paquete.
- **Secretos:** la revisión se basa en los patrones del script de inventario, que puede tener falsos negativos.
- **Comandos ejecutados (solo lectura):** `inventario.sh`, `npm audit --package-lock-only` (con y sin `--omit=dev`), `npm audit fix --package-lock-only --dry-run`, `npm outdated`, `git log`, `git ls-files`, `gh pr list` y `gh api` (alertas de Dependabot y protección de rama).
- Esta auditoría es un análisis estático del repositorio y no sustituye pruebas de penetración ni asesoría legal.
