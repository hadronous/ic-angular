import {
  type DevServerBuilderOptions,
  type DevServerBuilderOutput,
  executeDevServerBuilder,
} from '@angular/build';
import { type BuilderContext, createBuilder } from '@angular-devkit/architect';
import { resolve } from 'node:path';
import { canisterPlugin } from '../canister-plugin';

type Extensions = Parameters<typeof executeDevServerBuilder>[2];

export interface IcDevServerBuilderOptions extends DevServerBuilderOptions {
  dfx?: string;
}

export function serveIcApplication(
  options: IcDevServerBuilderOptions,
  context: BuilderContext,
  extensions: Extensions = {},
): AsyncIterable<DevServerBuilderOutput> {
  const dfx = options.dfx || './dfx.json';
  const dfxJsonPath = resolve(context.workspaceRoot, dfx);
  const dfxJson = require(dfxJsonPath);

  const dotEnv = dfxJson.output_env_file ?? '.env';
  const envPath = resolve(context.workspaceRoot, dotEnv);

  extensions = {
    ...extensions,
    buildPlugins: [...(extensions.buildPlugins || []), canisterPlugin(envPath)],
  };

  const proxyConfig = resolve(__dirname, 'proxy.conf.mjs');

  return executeDevServerBuilder(
    {
      ...options,
      proxyConfig,
    },
    context,
    extensions,
  );
}

export default createBuilder(serveIcApplication);
