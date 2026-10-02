import { createSign } from 'crypto';

export interface SignedPrefix {
  // Ends with "/". Append a filename, then "?" + query.
  baseUrl: string;
  query: string;
  expiresAt: number;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// CloudFront's URL-safe base64 variant.
function cloudfrontBase64(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/=/g, '_').replace(/\//g, '~');
}

// Signs a custom policy with a wildcard resource, so one query string grants access to
// every file under `prefix` (for example "session/optimism-monologue/") until it expires.
export function signPrefix(prefix: string, ttlSeconds: number): SignedPrefix {
  const domain = requireEnv('CLOUDFRONT_DOMAIN');
  const keyPairId = requireEnv('CLOUDFRONT_KEY_PAIR_ID');
  const privateKey = Buffer.from(requireEnv('CLOUDFRONT_PRIVATE_KEY_BASE64'), 'base64').toString('utf8');

  const baseUrl = `https://${domain}/${prefix}`;
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const policy = JSON.stringify({
    Statement: [{ Resource: `${baseUrl}*`, Condition: { DateLessThan: { 'AWS:EpochTime': expires } } }],
  });
  const signature = createSign('RSA-SHA1').update(policy).sign(privateKey);

  return {
    baseUrl,
    query: `Policy=${cloudfrontBase64(Buffer.from(policy))}&Signature=${cloudfrontBase64(signature)}&Key-Pair-Id=${keyPairId}`,
    expiresAt: expires * 1000,
  };
}
