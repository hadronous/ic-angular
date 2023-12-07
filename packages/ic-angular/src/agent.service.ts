import {
  APP_INITIALIZER,
  EnvironmentProviders,
  Inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { HttpAgent, Identity } from '@dfinity/agent';

@Injectable({ providedIn: 'root' })
export class IcAgentService {
  private readonly agent: HttpAgent;

  constructor(@Inject(IC_AGENT_OPTIONS) options: IcAgentOptions) {
    this.agent = new HttpAgent({
      host: options.apiGateway,
      verifyQuerySignatures: options.verifyQuerySignatures,
      retryTimes: options.retryTimes,
      useQueryNonces: options.useQueryNonces,
    });
  }

  public getInnerAgent(): HttpAgent {
    return this.agent;
  }

  public async fetchRootKey(): Promise<void> {
    await this.agent.fetchRootKey();
  }

  public replaceIdentity(identity: Identity): void {
    this.agent.replaceIdentity(identity);
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
    IcAgentService,
    { provide: IC_AGENT_OPTIONS, useValue: options },
    {
      provide: APP_INITIALIZER,
      useFactory: fetchRootKeyFactory,
      deps: [IcAgentService, IC_AGENT_OPTIONS],
      multi: true,
    },
  ]);
}
