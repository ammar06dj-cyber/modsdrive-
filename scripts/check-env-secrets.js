import fs from 'fs';
import path from 'path';

const filesToCheck = ['.env.example', '.env', '.env.local', '.env.production'];
const forbiddenKeywords = ['PASSWORD', 'SECRET', 'PRIVATE', 'SERVICE_ROLE', 'TOKEN'];

let hasViolation = false;

console.log('Checking environment files for exposed secrets in frontend variables...');

filesToCheck.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Skip empty or comment lines
      if (!trimmed || trimmed.startsWith('#')) return;

      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.slice(0, equalIndex).trim();
        if (key.startsWith('VITE_')) {
          const upperKey = key.toUpperCase();
          const violatingKeyword = forbiddenKeywords.find(kw => upperKey.includes(kw));
          if (violatingKeyword) {
            console.error(`\x1b[31m[SECURITY ERROR] File "${file}" contains a forbidden client-side variable "${key}" on line ${index + 1}.\x1b[0m`);
            console.error(`Client-side variables prefixed with "VITE_" must NOT contain "${violatingKeyword}" to prevent secret leakage in the frontend build.`);
            hasViolation = true;
          }
        }
      }
    });
  }
});

if (hasViolation) {
  console.error('\n\x1b[31mBuild aborted: Exposed secrets were found or suspected in client-side environment variables!\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32mEnvironment check successful: No secrets found in frontend variables.\x1b[0m');
}
