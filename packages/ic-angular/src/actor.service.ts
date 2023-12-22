import { Injectable } from '@angular/core';
import { Actor, ActorMethod } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { IcAgentService } from './agent.service';

/**
 * Candid interface of a canister.
 *
 * @category Actor
 */
export type ActorInterface = Record<string, ActorMethod>;

/**
 * An Angular-native service that provides a wrapper around the `Actor` class
 * from the `@dfinity/agent` library. This is only an interface. Use the
 * {@link createIcActorService} mixin to create a concrete class that
 * implements this interface.
 *
 * @category Actor
 * @see [@dfinity/agent: Actor](https://agent-js.icp.xyz/agent/classes/Actor.html)
 *
 * @example
 * ```ts
 * import { ApplicationConfig, Injectable } from '@angular/core';
 * import { createActorService, provideIcAgent } from '@hadronous/ic-angular';
 * import { environment } from '../environments/environment';
 *
 * // temporary fix until DFX upgrades to Candid version 0.10.0
 * // with this version, the idlFactory will be correctly exported from the .did file
 * const { idlFactory } = require('../../../declarations/counter.did');
 * import { _SERVICE } from '../../../declarations/counter.did';
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
 *    CounterActorService
 *  ],
 * };
 * ```
 */
export interface IcActorService<T = ActorInterface> extends Function {
  /**
   * @private
   */
  new (agentService: IcAgentService): T;
}

/**
 * Options for creating a concrete {@link IcActorService} class.
 *
 * @category Actor
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
 * @category Actor
 * @see {@link IcActorService}
 * @see {@link provideIcAgent}
 *
 * @example
 * ```ts
 * import { ApplicationConfig, Injectable } from '@angular/core';
 * import { createActorService, provideIcAgent } from '@hadronous/ic-angular';
 * import { environment } from '../environments/environment';
 *
 * // temporary fix until DFX upgrades to Candid version 0.10.0
 * // with this version, the idlFactory will be correctly exported from the .did file
 * const { idlFactory } = require('../../../declarations/counter.did');
 * import { _SERVICE } from '../../../declarations/counter.did';
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
 *    CounterActorService
 *  ],
 * };
 * ```
 */
export function createIcActorService<T = Record<string, ActorMethod>>({
  idlFactory,
  canisterId,
}: CreateActorOptions): IcActorService<T> {
  const ActorClass = Actor.createActorClass(idlFactory);

  @Injectable({ providedIn: 'root' })
  class IcActorServiceImpl extends ActorClass {
    constructor(agentService: IcAgentService) {
      super({
        canisterId,
        agent: agentService.getInnerAgent(),
      });
    }
  }

  return IcActorServiceImpl as IcActorService<T>;
}
