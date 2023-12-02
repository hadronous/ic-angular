const DFX_NETWORK = import.meta.DFX_NETWORK ?? 'local';
const IS_MAINNET = DFX_NETWORK === 'mainnet';
const API_GATEWAY = IS_MAINNET ? 'https://icp-api.io' : undefined;
const BACKEND_CANISTER_ID = import.meta.EXAMPLE_BACKEND_CANISTER_ID ?? '';

export const environment = {
  API_GATEWAY: API_GATEWAY,
  BACKEND_CANISTER_ID: BACKEND_CANISTER_ID,
  DFX_NETWORK: DFX_NETWORK,
};
