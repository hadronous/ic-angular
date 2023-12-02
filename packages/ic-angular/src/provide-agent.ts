import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { API_GATEWAY } from './api-gateway.token';
import { ICP_AGENT_PROVIDER } from './agent.service';

export interface ProvideAgentOptions {
  apiGateway: string | undefined;
}

export function provideAgent({
  apiGateway,
}: ProvideAgentOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_GATEWAY, useValue: apiGateway },
    ICP_AGENT_PROVIDER,
  ]);
}
