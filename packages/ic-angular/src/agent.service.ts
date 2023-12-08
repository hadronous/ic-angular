import {
  APP_INITIALIZER,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { HttpAgent, Identity } from '@dfinity/agent';

@Injectable({ providedIn: 'root' })
export class IcAgentService {
  constructor(private readonly httpAgent: HttpAgent) {}

  public getInnerAgent(): HttpAgent {
    return this.httpAgent;
  }

  public async fetchRootKey(): Promise<void> {
    await this.httpAgent.fetchRootKey();
  }

  public replaceIdentity(identity: Identity): void {
    this.httpAgent.replaceIdentity(identity);
  }
}

export interface IcAgentOptions {
  apiGateway?: string;
  fetchRootKey?: boolean;
  verifyQuerySignatures?: boolean;
  retryTimes?: number;
  useQueryNonces?: boolean;
}

export const IC_AGENT_OPTIONS = new InjectionToken<IcAgentOptions>(
  'IC_AGENT_OPTIONS',
);

function agentServiceFactory(options: IcAgentOptions): IcAgentService {
  const httpAgent = new HttpAgent({
    host: options.apiGateway,
    verifyQuerySignatures: options.verifyQuerySignatures,
    retryTimes: options.retryTimes,
    useQueryNonces: options.useQueryNonces,
  });

  return new IcAgentService(httpAgent);
}

function fetchRootKeyFactory(
  agentService: IcAgentService,
  options: IcAgentOptions,
): () => Promise<void> {
  return async () => {
    if (options.fetchRootKey) {
      await agentService.fetchRootKey();
    }
  };
}

export function provideIcAgent(options: IcAgentOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: IcAgentService,
      useFactory: agentServiceFactory,
      deps: [IC_AGENT_OPTIONS],
    },
    { provide: IC_AGENT_OPTIONS, useValue: options },
    {
      provide: APP_INITIALIZER,
      useFactory: fetchRootKeyFactory,
      deps: [IcAgentService, IC_AGENT_OPTIONS],
      multi: true,
    },
  ]);
}
