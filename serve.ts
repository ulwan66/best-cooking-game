// Golden Ladle's local server (Node 22, standard library only): serves game/
// on http://localhost:8080 so the game can be played and screenshotted in a
// desktop browser. Run it from the repository root: `node serve.ts`.
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(join(fileURLToPath(new URL('.', import.meta.url)), 'game'));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost:8080');
  const rel = normalize(url.pathname.replace(/^\/+/, '') || 'index.html');
  const file = join(root, rel);
  if (!file.startsWith(root + sep) && file !== root) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  const stream = createReadStream(file);
  stream.on('error', () => {
    res.writeHead(404);
    res.end('not found');
  });
  stream.on('open', () => {
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    stream.pipe(res);
  });
});

server.listen(8080, () => {
  console.log('Golden Ladle at http://localhost:8080');
});
