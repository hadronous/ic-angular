import {
  ApplicationBuilderExtensions,
  type ApplicationBuilderOptions,
  ApplicationBuilderOutput,
  buildApplication,
} from '@angular/build';
import { type BuilderContext, createBuilder } from '@angular-devkit/architect';
import { resolve } from 'node:path';
import { canisterPlugin } from '../canister-plugin';

export interface IcApplicationBuilderOptions extends ApplicationBuilderOptions {
  dfx?: string;
}

export function buildIcApplication(
  options: IcApplicationBuilderOptions,
  context: BuilderContext,
  extensions: ApplicationBuilderExtensions = {},
): AsyncIterable<ApplicationBuilderOutput> {
  const dfx = options.dfx || './dfx.json';
  const dfxJsonPath = resolve(context.workspaceRoot, dfx);
  const dfxJson = require(dfxJsonPath);

  const dotEnv = dfxJson.output_env_file ?? '.env';
  const envPath = resolve(context.workspaceRoot, dotEnv);

  extensions.codePlugins = extensions.codePlugins || [];
  extensions.codePlugins.push(canisterPlugin(envPath));

  return buildApplication(options, context, extensions);
}

export default createBuilder(buildIcApplication);
