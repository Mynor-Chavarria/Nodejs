import { parentPort } from 'node:worker_threads';

// Este codigo corre en un hilo SEPARADO, con su propio Event Loop.
// Aunque este hilo se bloquee, el hilo principal del servidor sigue libre.
parentPort.on('message', ({ iterations }) => {
  for (let i = 0; i < iterations; i++) {
    // Solo se bloquea ESTE hilo.
  }

  // Devolvemos el resultado al hilo principal.
  parentPort.postMessage({
    message: 'CPU terminada en un Worker Thread. El Event Loop siguio libre.',
  });
});
