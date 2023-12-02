import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

async function copyFile(src, dest) {
  const srcFile = await readFile(new URL(src));

  await writeFile(new URL(dest), srcFile);
}

async function readJsonFile(src) {
  const srcFile = await readFile(new URL(src));

  return JSON.parse(srcFile);
}

async function writeJsonFile(dest, data) {
  const jsonData = JSON.stringify(data, null, 2);

  await writeFile(new URL(dest), jsonData);
}

function extendScheme(scheme, schemeExtension) {
  return {
    ...scheme,
    ...schemeExtension,
    properties: {
      ...scheme.properties,
      ...schemeExtension.properties,
    },
    definitions: {
      ...scheme.definitions,
      ...schemeExtension.definitions,
    },
  };
}

const srcDir = import.meta.resolve('./src');
const distDir = import.meta.resolve('./dist');

const proxyConf = join('dev-server', 'proxy.conf.mjs');
const proxyConfSrc = join(srcDir, proxyConf);
const proxyConfDist = join(distDir, proxyConf);
await copyFile(proxyConfSrc, proxyConfDist);

const applicationSchemeExtSrc = join(srcDir, 'application', 'schema.ext.json');
const applicationSchemeDist = join(distDir, 'application', 'schema.json');
const applicationSchemeExt = await readJsonFile(applicationSchemeExtSrc);
const applicationSchema = require('@angular-devkit/build-angular/src/builders/application/schema.json');
const extendedApplicationSchema = extendScheme(
  applicationSchema,
  applicationSchemeExt,
);
await writeJsonFile(applicationSchemeDist, extendedApplicationSchema);

const devServerSchemeExtSrc = join(srcDir, 'dev-server', 'schema.ext.json');
const devServerSchemeDist = join(distDir, 'dev-server', 'schema.json');
const devServerSchemeExt = await readJsonFile(devServerSchemeExtSrc);
const devServerSchema = require('@angular-devkit/build-angular/src/builders/dev-server/schema.json');
const extendedDevServerSchema = extendScheme(
  devServerSchema,
  devServerSchemeExt,
);
await writeJsonFile(devServerSchemeDist, extendedDevServerSchema);
