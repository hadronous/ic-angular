import { Injectable, Injector, Provider } from '@angular/core';
import { Actor, ActorMethod } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { ICP_AGENT } from './agent.service';

export type ActorInterface = Record<string, ActorMethod>;

export type IcpActor<T = ActorInterface> = T & {
  new (): IcpActor<T>;
};

export interface CreateActorOptions {
  idlFactory: IDL.InterfaceFactory;
  canisterId: string;
}

export function createActor<T = Record<string, ActorMethod>>({
  idlFactory,
  canisterId,
}: CreateActorOptions): IcpActor<T> {
  const ActorClass = Actor.createActorClass(idlFactory);

  @Injectable({ providedIn: 'root' })
  class IcpActorImpl extends ActorClass {
    constructor(injector: Injector) {
      const agent = injector.get(ICP_AGENT);

      super({
        canisterId,
        agent: agent.getInnerAgent(),
      });
    }
  }

  return IcpActorImpl as IcpActor<T>;
}

export function actorProvider({
  idlFactory,
  canisterId,
}: CreateActorOptions): Provider {
  return {
    provide: canisterId,
    useClass: createActor({ idlFactory, canisterId }),
  };
}
