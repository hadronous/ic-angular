import { Injectable } from '@angular/core';
import { createIcActorService } from '@hadronous/ic-angular';
import { environment } from '../environments/environment';

import {
  idlFactory,
  _SERVICE,
} from '../../../declarations/example_backend.did';

@Injectable({ providedIn: 'root' })
export class BackendActorService extends createIcActorService<_SERVICE>({
  idlFactory,
  canisterId: environment.BACKEND_CANISTER_ID,
}) {}
