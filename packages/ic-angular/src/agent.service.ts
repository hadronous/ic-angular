import { InjectionToken, Provider } from '@angular/core';
import { HttpAgent, Identity } from '@dfinity/agent';
import { API_GATEWAY } from './api-gateway.token';

export class IcpAgent {
  constructor(private readonly agent: HttpAgent) {}

  public getInnerAgent(): HttpAgent {
    return this.agent;
  }

  public replaceIdentity(identity: Identity): void {
    this.agent.replaceIdentity(identity);
  }
}

export const ICP_AGENT = new InjectionToken<IcpAgent>('ICP_AGENT');

export const ICP_AGENT_PROVIDER: Provider = {
  provide: ICP_AGENT,
  useFactory: agentFactory,
  deps: [API_GATEWAY],
};

function agentFactory(host: string | undefined): IcpAgent {
  return new IcpAgent(
    new HttpAgent({
      host,
      verifyQuerySignatures: false,
    }),
  );
}
