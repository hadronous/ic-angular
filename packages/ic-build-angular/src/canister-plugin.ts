import { config } from 'dotenv';
import { type Plugin } from 'esbuild';

interface Definitions {
  ['import.meta']?: string;
}

export function canisterPlugin(envPath: string): Plugin {
  config({ path: envPath });

  const definitions = Object.entries(process.env).reduce<Definitions>(
    (accum, [key, value]) => {
      key = key.toUpperCase();
      if (key.startsWith('CANISTER_ID_') || key === 'DFX_NETWORK') {
        accum = {
          ...accum,
          [`import.meta.${key}`]: `"${value}"`,
        };
      }

      return accum;
    },
    {},
  );

  return {
    name: 'canister-plugin',
    setup(build) {
      build.initialOptions.define = {
        ...build.initialOptions.define,
        ...definitions,
      };
    },
  };
}
