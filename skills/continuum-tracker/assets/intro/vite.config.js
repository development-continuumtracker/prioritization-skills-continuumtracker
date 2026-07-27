import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { basename } from 'node:path';

// Each prototype gets its OWN stable dev port, derived from its folder name, so:
//  - two prototypes can run at the same time without a port clash, and
//  - each keeps a distinct localhost origin, so the per-origin onboarding
//    localStorage flag never leaks between prototypes (a sibling can't suppress
//    another's first-run tour).
// strictPort:false lets Vite fall through to the next free port if this one is taken.
function protoPort() {
  const name = basename(process.cwd());
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return 5200 + (h % 700); // 5200–5899
}

export default defineConfig({
  plugins: [react()],
  server: { port: protoPort(), strictPort: false, open: true },
});
