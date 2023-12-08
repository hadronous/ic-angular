import { Injectable } from '@angular/core';
import { Actor, ActorMethod } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { IcAgentService } from './agent.service';

export type ActorInterface = Record<string, ActorMethod>;

export interface IcActor<T = ActorInterface> extends Function {
  new (agentService: IcAgentService): T;
}

export interface CreateActorOptions {
  idlFactory: IDL.InterfaceFactory;
  canisterId: string | Principal;
}

export function createIcActorService<T = Record<string, ActorMethod>>({
  idlFactory,
  canisterId,
}: CreateActorOptions): IcActor<T> {
  const ActorClass = Actor.createActorClass(idlFactory);

  @Injectable({ providedIn: 'root' })
  class IcActorService extends ActorClass {
    constructor(agentService: IcAgentService) {
      super({
        canisterId,
        agent: agentService.getInnerAgent(),
      });
    }
  }

  return IcActorService as IcActor<T>;
}

export interface ProvideActorOptions {
  idlFactory: IDL.InterfaceFactory;
  canisterId: string;
}
