import { createHmac, createHash, BinaryLike } from 'crypto';

export function sha1(str: string, key: BinaryLike): string {
  return createHmac('sha1', key)
    .update(str)
    .digest('hex');
}

export function hash(str: string, algorithm: string): string {
  return createHash(algorithm)
    .update(str)
    .digest('hex');
}
