import {
  type ApplicationBuilderOptions,
  buildApplication,
} from '@angular-devkit/build-angular';
import {
  type BuilderContext,
  type BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { type Plugin } from 'esbuild';
import { resolve } from 'node:path';
import { canisterPlugin } from '../canister-plugin';

export interface IcApplicationBuilderOptions extends ApplicationBuilderOptions {
  dfx?: string;
}

export function buildIcApplication(
  options: IcApplicationBuilderOptions,
  context: BuilderContext,
  plugins?: Plugin[],
): AsyncIterable<BuilderOutput> {
  const dfx = options.dfx || './dfx.json';
  const dfxJsonPath = resolve(context.workspaceRoot, dfx);
  const dfxJson = require(dfxJsonPath);

  const dotEnv = dfxJson.output_env_file ?? '.env';
  const envPath = resolve(context.workspaceRoot, dotEnv);

  plugins = [...(plugins || []), canisterPlugin(envPath)];

  return buildApplication(options, context, plugins);
}

export default createBuilder(buildIcApplication);
