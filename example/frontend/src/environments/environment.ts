const DFX_NETWORK = import.meta.DFX_NETWORK ?? 'local';
const IS_MAINNET = DFX_NETWORK === 'mainnet';
const API_GATEWAY = IS_MAINNET ? 'https://icp-api.io' : window.location.origin;
const IDENTITY_PROVIDER = IS_MAINNET
  ? 'https://identity.ic0.app/'
  : 'http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080/';
const BACKEND_CANISTER_ID = import.meta.EXAMPLE_BACKEND_CANISTER_ID ?? '';

export const environment = {
  API_GATEWAY,
  BACKEND_CANISTER_ID,
  DFX_NETWORK,
  IDENTITY_PROVIDER,
  IS_MAINNET,
};
