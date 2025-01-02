import { inject, Injectable } from '@angular/core';
import { Actor, ActorMethod } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { IcAgentService } from './agent.service';

/**
 * Candid interface of a canister.
 */
export type ActorInterface = Record<string, ActorMethod>;

/**
 * An Angular-native service that provides a wrapper around the `Actor` class
 * from the `@dfinity/agent` library. This is only an interface. Use the
 * {@link createIcActorService} mixin to create a concrete class that
 * implements this interface.
 *
 * @see [@dfinity/agent: Actor](https://agent-js.icp.xyz/agent/classes/Actor.html)
 *
 * @example
 * ```ts
 * import { ApplicationConfig, Injectable } from '@angular/core';
 * import { createActorService, provideIcAgent } from '@hadronous/ic-angular';
 * import { environment } from '../environments/environment';
 *
 * import { idlFactory, _SERVICE } from '../../../declarations/example_backend.did';
 *
 * @Injectable({ providedIn: 'root' })
 * class CounterActorService extends createActorService<_SERVICE>({
 *  idlFactory,
 *  canisterId: environment.COUNTER_CANISTER_ID,
 * });
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *    provideIcAgent({
 *      apiGateway: environment.API_GATEWAY,
 *      fetchRootKey: !environment.IS_MAINNET,
 *    }),
 *  ],
 * };
 * ```
 */
export interface IcActorService<T = ActorInterface> extends Function {
  /**
   * @private
   */
  new (): T;
}

/**
 * Options for creating a concrete {@link IcActorService} class.
 */
export interface CreateActorOptions {
  idlFactory: IDL.InterfaceFactory;
  canisterId: string | Principal;
}

/**
 * Creates a concrete {@link IcActorService} class that wraps the `Actor` class
 * from `@dfinity/agent` and provides an Angular-native expereience for
 * communicating with canisters.
 *
 * @param options Options for creating a concrete {@link IcActorService} class.
 * @returns A concrete {@link IcActorService} class that can be used as an
 * `Injectable` service within the Angular dependency injection system.
 * @see {@link IcActorService}
 * @see {@link provideIcAgent}
 *
 * @example
 * ```ts
 * import { ApplicationConfig, Injectable } from '@angular/core';
 * import { createActorService, provideIcAgent } from '@hadronous/ic-angular';
 * import { environment } from '../environments/environment';
 *
 * import { idlFactory, _SERVICE } from '../../../declarations/example_backend.did';
 *
 * @Injectable({ providedIn: 'root' })
 * class CounterActorService extends createActorService<_SERVICE>({
 *  idlFactory,
 *  canisterId: environment.COUNTER_CANISTER_ID,
 * });
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *    provideIcAgent({
 *      apiGateway: environment.API_GATEWAY,
 *      fetchRootKey: !environment.IS_MAINNET,
 *    }),
 *  ],
 * };
 * ```
 */
export function createIcActorService<T = Record<string, ActorMethod>>({
  idlFactory,
  canisterId,
}: CreateActorOptions): IcActorService<T> {
  const ActorClass = Actor.createActorClass(idlFactory);

  @Injectable()
  class IcActorServiceImpl extends ActorClass {
    constructor() {
      const agentService = inject(IcAgentService);

      super({
        canisterId,
        agent: agentService.getInnerAgent(),
      });
    }
  }

  return IcActorServiceImpl as IcActorService<T>;
}
