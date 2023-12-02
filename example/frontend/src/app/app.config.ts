import { ApplicationConfig } from '@angular/core';
import { provideAgent, provideActor } from '@hadronous/ic-angular';
import { environment } from '../environments/enviornment';

// temporary fix until DFX upgrades to Candid version 0.10.0
// with this version, the idlFactory will be correctly exported from the .did file
// import { idlFactory } from '../../../declarations/example_backend.did';
const { idlFactory } = require('../../../declarations/example_backend.did');

export const appConfig: ApplicationConfig = {
  providers: [
    provideAgent({ apiGateway: environment.API_GATEWAY }),
    provideActor({ canisterId: environment.BACKEND_CANISTER_ID, idlFactory }),
  ],
};
