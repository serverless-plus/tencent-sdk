import lerna from 'lerna';
import * as childproc from 'child_process';

import project from './project';
import { createLogger, c } from './logger';

const DIST_TAG = 'next';

const log = createLogger('publish');

const getVersion = async () => {
  const re = /(\d+)\.(\d+)\.(\d+)($|\-)/;
  const match = project.lerna.version.match(re);

  if (match === null) {
    throw new Error('Lerna version is malformed.');
  }

  const [, major, minor, patch] = match;

  return { major, minor, patch };
};

const getCommitSHA = async () => {
  return new Promise((resolve, reject) => {
    childproc.exec('git rev-parse --short=7 HEAD', (err, stdout) => {
      if (err) {
        return reject(err);
      }

      resolve(stdout);
    });
  });
};

const getDate = (sep?: string): string => {
  const s = sep === undefined ? '' : sep;
  const raw = new Date()
    .toISOString()
    .replace(/:|T|\.|-/g, '')
    .slice(0, 8);
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  return `${y}${s}${m}${s}${d}`;
};

const publish = async () => {
  if (process.env.CI && process.env.TRAVIS_BRANCH !== 'master') {
    return;
  }

  try {
    const { major, minor, patch } = await getVersion();
    const sha = await getCommitSHA();
    const version = `${major}.${minor}.${patch}-${DIST_TAG}.${getDate()}`;

    lerna([
      'publish',
      version,
      '--npm-tag',
      DIST_TAG,
      '--exact',
      '--no-git-tag-version',
      '--no-push',
      '--no-verify-access',
      '--no-verify-registry',
      '-y',
    ]);

    return version;
  } catch (err) {
    log(`Could not publish: ${err}`);
    throw err;
  }
};

publish().then((v) => log(`Published new packages with version ${v}`));
