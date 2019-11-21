import * as fs from 'fs';
import * as path from 'path';

import * as rollup from 'rollup';
import json from 'rollup-plugin-json';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import typescript2 from 'rollup-plugin-typescript2';
import ts from 'typescript';

import project from './project';
import { c, createLogger } from './logger';

const logPreProcess = createLogger('preprocess');
const logBundle = createLogger('bundle');

function getKeys(p) {
  const packageJsonFile = `${process.cwd()}/packages/${p}/package.json`;
  const data = fs.readFileSync(packageJsonFile, 'utf-8');
  const { dependencies } = JSON.parse(data);
  return dependencies ? Object.keys(dependencies) : [];
}

async function bundle() {
  try {
    const outputs = process.argv.slice(2)[0].split(',');
    const packages = project.packages;

    const count = packages.length;
    let cur = 0;
    for (const pkg of packages) {
      const logPrefix = c.grey(`[${++cur}/${count}] ${pkg.scopedName}`);
      logBundle(`${logPrefix} creating bundle`);

      const externals = project.packages
        .filter((p) => p.name !== pkg.name)
        .map((p) => p.scopedName);

      logBundle(`externals: ${externals}`);

      const bundle = await rollup.rollup({
        input: path.join(pkg.src, 'index.ts'),
        plugins: [
          resolve({
            browser: true,
            jsnext: true,
            preferBuiltins: true,
          }),
          globals(),
          json(),
          typescript2({
            tsconfig: path.join(pkg.path, 'tsconfig.json'),
            typescript: ts, // ensure we're using the same typescript (3.x) for rollup as for regular builds etc
            tsconfigOverride: {
              module: 'esnext',
              stripInternal: true,
              emitDeclarationOnly: false,
              composite: false,
              declaration: false,
              declarationMap: false,
              sourceMap: true,
            },
          }),
        ],
        external: getKeys(pkg.name),
      });

      // 'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd'
      if (outputs.indexOf('esm') === -1) {
        logBundle(`${logPrefix} skipping esm`);
      } else {
        logBundle(`${logPrefix} writing esm - ${pkg.esm}`);

        await bundle.write({
          file: pkg.esm,
          name: pkg.globalName,
          format: 'esm',
          sourcemap: true,
        });
      }

      if (outputs.indexOf('umd') === -1) {
        logBundle(`${logPrefix} skipping umd`);
      } else {
        logBundle(`${logPrefix} writing umd - ${pkg.umd}`);

        await bundle.write({
          file: pkg.umd,
          exports: 'named',
          name: pkg.globalName,
          globals: {
            ...getKeys(pkg.name).reduce((g, packages) => {
              if (packages === pkg.name) {
                g[pkg.scopedName] = pkg.globalName;
              } else {
                g[packages] = packages;
              }
              return g;
            }, {}),
            tslib: 'tslib',
          },
          format: 'umd',
          sourcemap: true,
        });
      }
    }
  } catch (err) {
    logBundle('Failed to bundle:');
    logBundle(err);
    process.exit(1);
  }
}

bundle();
