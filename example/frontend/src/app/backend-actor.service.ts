import { createActorService } from '@hadronous/ic-angular';
import { environment } from '../environments/environment';

// temporary fix until DFX upgrades to Candid version 0.10.0
// with this version, the idlFactory will be correctly exported from the .did file
// import { idlFactory } from '../../../declarations/example_backend.did';
const { idlFactory } = require('../../../declarations/example_backend.did');
import { _SERVICE } from '../../../declarations/example_backend.did';

export class BackendActorService extends createActorService<_SERVICE>({
  idlFactory,
  canisterId: environment.BACKEND_CANISTER_ID,
}) {}
