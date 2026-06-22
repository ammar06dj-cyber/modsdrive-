import { isSafeUrl } from '../src/utils/sanitizeUrl';

const tests = [
  // Approved safe URLs
  { url: 'https://images.unsplash.com/photo-1617469767053', expectedSafe: true },
  { url: 'https://modsfire.com/download/mod.zip', expectedSafe: true },
  { url: 'https://google.com', expectedSafe: true },

  // HTTP / unsafe protocol rejections
  { url: 'http://example.com', expectedSafe: false },
  { url: 'javascript:alert(1)', expectedSafe: false },
  { url: 'data:image/png;base64,abc', expectedSafe: false },
  { url: 'file:///etc/passwd', expectedSafe: false },
  { url: 'ftp://files.com', expectedSafe: false },

  // Localhost and loopback IPv4 rejections
  { url: 'https://localhost', expectedSafe: false },
  { url: 'https://127.0.0.1', expectedSafe: false },
  { url: 'https://127.255.255.254', expectedSafe: false },

  // Private network IPv4 rejections
  { url: 'https://10.0.0.1', expectedSafe: false },
  { url: 'https://172.16.50.4', expectedSafe: false },
  { url: 'https://172.31.255.255', expectedSafe: false },
  { url: 'https://192.168.1.100', expectedSafe: false },

  // Specific requested rejections
  { url: 'https://0.0.0.0', expectedSafe: false },
  { url: 'https://169.254.0.1', expectedSafe: false }, // link-local IPv4

  // Localhost, link-local, and ULA IPv6 rejections
  { url: 'https://[::1]', expectedSafe: false },
  { url: 'https://[0:0:0:0:0:0:0:1]', expectedSafe: false },
  { url: 'https://[::]', expectedSafe: false },
  { url: 'https://[fe80::1]', expectedSafe: false },
  { url: 'https://[fc00::100]', expectedSafe: false },
  { url: 'https://[fd12:3456:789a:1::1]', expectedSafe: false },

  // IPv4-mapped/compatible IPv6 rejections
  { url: 'https://[::ffff:127.0.0.1]', expectedSafe: false },
  { url: 'https://[::ffff:192.168.1.1]', expectedSafe: false },
  { url: 'https://[::ffff:10.0.0.1]', expectedSafe: false },
  { url: 'https://[::127.0.0.1]', expectedSafe: false },

  // Invalid structure rejections
  { url: '', expectedSafe: false },
  { url: '   ', expectedSafe: false },
  { url: 'https://', expectedSafe: false },
];

let passed = true;

for (const t of tests) {
  const isSafe = isSafeUrl(t.url);
  const success = isSafe === t.expectedSafe;
  if (!success) {
    passed = false;
    console.error(`FAIL - URL: ${t.url || '<empty>'} -> Expected Safe: ${t.expectedSafe}, Got: ${isSafe}`);
  } else {
    console.log(`PASS - URL: ${t.url || '<empty>'} -> ${isSafe ? 'Safe' : 'Unsafe'}`);
  }
}

if (!passed) {
  console.error('\nSanitization validation failed!');
  process.exit(1);
} else {
  console.log('\nAll sanitization tests passed successfully.');
}
