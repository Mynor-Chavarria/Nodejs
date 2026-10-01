import express from 'express';
import { Worker } from 'node:worker_threads';

const app = express();
const PORT = 3000;

// ------------------------------------------------------------
// 1) RUTA RAPIDA
// El Event Loop recibe la peticion, responde y queda libre al instante.
// Usala como "termometro": si esta ruta tarda, el Event Loop esta bloqueado.
app.get('/fast', (req, res) => {
  res.json({ status: 'ok', message: 'Respuesta rapida (Event Loop libre)' });
});

// ------------------------------------------------------------
// 2) I/O LENTO (simula una base de datos lenta)
// setTimeout delega la espera al sistema (libuv) y el Event Loop sigue libre.
// Mientras esperamos 4 seg, /fast responde sin problema.
app.get('/slow-io', (req, res) => {
  setTimeout(() => {
    res.json({ message: 'I/O resuelto despues de 4 seg' });
  }, 4000);
});

// ------------------------------------------------------------
// 3) CPU PESADA EN EL HILO PRINCIPAL (INTENCIONALMENTE MALO)
// El bucle es sincronico: el Event Loop NO puede atender nada mas hasta terminar.
// Durante este tiempo /fast, /slow-io y cualquier otra peticion quedan congeladas.
app.get('/heavy-cpu-block', (req, res) => {
  console.time('heavy-cpu-block');

  for (let i = 0; i < 5_000_000_000; i++) {
    // Event Loop secuestrado.
  }

  console.timeEnd('heavy-cpu-block');
  res.json({ message: 'CPU terminada. El Event Loop estuvo secuestrado.' });
});

// ------------------------------------------------------------
// 4) CPU PESADA EN UN WORKER THREAD (LA SOLUCION)
// El calculo corre en otro hilo con su propio Event Loop.
// El hilo principal queda libre para responder /fast mientras el worker trabaja.
const runHeavyTask = (data) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url));

    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`El worker termino con codigo ${code}`));
      }
    });

    worker.postMessage(data);
  });

app.get('/heavy-cpu-worker', async (req, res) => {
  try {
    console.time('heavy-cpu-worker');

    // await NO bloquea el Event Loop: el worker calcula mientras seguimos atendiendo peticiones.
    const result = await runHeavyTask({ iterations: 5_000_000_000 });

    console.timeEnd('heavy-cpu-worker');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
