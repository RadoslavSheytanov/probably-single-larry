/**
 * Manually insert a token into the database.
 * Usage: npm run add-token <email> <license-key>
 * Usage: npm run add-token list
 * Example: npm run add-token user@example.com ABCD-EFGH-IJKL-MNOP
 */
import { initDB } from '../src/db/client.js';
import { insertToken, listTokens } from '../src/db/tokens.js';

const [, , email, token, ...rest] = process.argv;

if (!email || !token) {
  console.error('Usage: bun run add-token <email> <token>');
  console.error('       bun run add-token list');
  process.exit(1);
}

if (email === 'list') {
  initDB();
  const tokens = listTokens();
  if (tokens.length === 0) {
    console.log('No tokens in database.');
  } else {
    console.table(tokens.map((t) => ({
      email: t.email,
      status: t.status,
      token_prefix: t.token.slice(0, 12) + '…',
      hash_prefix: t.token_hash.slice(0, 8) + '…',
      max_sessions: t.max_sessions,
    })));
  }
  process.exit(0);
}

initDB();
insertToken({ token, email });
console.log(`✓ Token added`);
console.log(`  email: ${email}`);
console.log(`  token: ${token.slice(0, 8)}…`);
console.log(`\nShare this access link with the buyer:`);
console.log(`  https://singularis.app?t=${token.trim().toUpperCase()}`);
