import { ApplicationConfig } from '@angular/core';
import { provideIcAgent, provideIcAuth } from '@hadronous/ic-angular';
import { environment } from '../environments/environment';

import { BackendActorService } from './backend-actor.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcAgent({
      apiGateway: environment.API_GATEWAY,
      fetchRootKey: !environment.IS_MAINNET,
    }),
    provideIcAuth({
      identityProvider: environment.IDENTITY_PROVIDER,
      idlOptions: { idleTimeout: 1_000 * 60 }, // 1 minute
      maxTimeToLive: BigInt(1_000 * 2), // 2 seconds
    }),
    BackendActorService,
  ],
};
