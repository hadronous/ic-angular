import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { IDL } from '@dfinity/candid';
import { actorProvider } from './actor.service';

export interface ProvideActorOptions {
  idlFactory: IDL.InterfaceFactory;
  canisterId: string;
}

export function provideActor({
  idlFactory,
  canisterId,
}: ProvideActorOptions): EnvironmentProviders {
  return makeEnvironmentProviders([actorProvider({ idlFactory, canisterId })]);
}
