# Event Loop Lab

Ejercicio para ver la diferencia entre:

- I/O lento que no bloquea el Event Loop.
- CPU pesada en el hilo principal, que si bloquea.
- CPU pesada en un Worker Thread, que deja libre el hilo principal.

## Instalacion

```bash
npm install
```

## Ejecutar

```bash
npm start
```

Servidor:

```text
http://localhost:3000
```

## Rutas

Respuesta rapida:

```bash
curl http://localhost:3000/fast
```

Simula I/O lento de 4 segundos sin bloquear el Event Loop:

```bash
curl http://localhost:3000/slow-io
```

CPU pesada en el hilo principal. Mientras esta ruta corre, `/fast` tambien queda esperando:

```bash
curl http://localhost:3000/heavy-cpu-block
```

CPU pesada en Worker Thread. Mientras esta ruta corre, prueba `/fast` en otra terminal y deberia responder:

```bash
curl http://localhost:3000/heavy-cpu-worker
```

## Prueba sugerida

Abre dos terminales.

Terminal 1:

```bash
curl http://localhost:3000/heavy-cpu-block
```

Terminal 2, inmediatamente despues:

```bash
curl http://localhost:3000/fast
```

Vas a notar que `/fast` espera.

Luego repite usando:

```bash
curl http://localhost:3000/heavy-cpu-worker
```

En este caso `/fast` deberia responder mientras el worker sigue calculando.
