import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { HttpAgent, Identity } from '@dfinity/agent';

/**
 * Options for providing the {@link IcAgentService} using {@link provideIcAgent}.
 */
export interface IcAgentOptions {
  /**
   * The URL of the IC API gateway to use.
   * Locally this should be `window.location.origin`, on mainnet net
   * this should be `https://icp-api.io`.
   */
  apiGateway?: string;

  /**
   * Whether to fetch the root key from the IC network.
   *
   * **WARNING**: This should _NEVER_ be `true` on mainnet. _Only_ when using a local
   * replica such as DFX or PocketIC.
   */
  fetchRootKey?: boolean;

  /**
   * Whether to verify query signatures.
   * Set this to `false` if you are using DFX v0.15.1 or earlier.
   * This can optionally be set to `true` when using DFX v0.15.2 or later.
   * It is recommended to set this to `true`.
   *
   * @see [@dfinity/agent: verifyQuerySignatures](https://agent-js.icp.xyz/agent/interfaces/HttpAgentOptions.html#verifyQuerySignatures)
   */
  verifyQuerySignatures?: boolean;

  /**
   * The number of times to retry a request if it fails.
   *
   * @see [@dfinity/agent: retryTimes](https://agent-js.icp.xyz/agent/interfaces/HttpAgentOptions.html#retryTimes)
   */
  retryTimes?: number;

  /**
   * Whether to use query nonces to prevent cache hits.
   *
   * @see [@dfinity/agent: useQueryNonces](https://agent-js.icp.xyz/agent/interfaces/HttpAgentOptions.html#useQueryNonces)
   */
  useQueryNonces?: boolean;
}

export const IC_AGENT_OPTIONS = new InjectionToken<IcAgentOptions>(
  'IC_AGENT_OPTIONS',
);

/**
 * An Angular-native service that provides a wrapper around the `HttpAgent`
 * class from the `@dfinity/agent` library. This service is used internally
 * by the {@link IcActorService} and {@link IcAuthService} services and should
 * not need to be used by consumers of this library directly.
 *
 * Must be provided using the {@link provideIcAgent} function.
 *
 * @see [@dfinity/agent: HttpAgent](https://agent-js.icp.xyz/agent/classes/HttpAgent.html)
 *
 * @example
 * ```ts
 * import { ApplicationConfig } from '@angular/core';
 * import { provideIcAgent } from '@hadronous/ic-angular';
 * import { environment } from '../environments/environment';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *    provideIcAgent({
 *      apiGateway: environment.API_GATEWAY,
 *      fetchRootKey: !environment.IS_MAINNET,
 *      verifyQuerySignatures: true,
 *      retryTimes: 3,
 *      useQueryNonces: false,
 *    }),
 *  ],
 * };
 * ```
 */
@Injectable({
  providedIn: 'root',
  useFactory: agentServiceFactory,
})
export class IcAgentService {
  /**
   * @private
   */
  constructor(private readonly httpAgent: HttpAgent) {}

  /**
   * Get the wrapped `HttpAgent` instance.
   *
   * @returns The inner `HttpAgent` instance.
   * @see [@dfinity/agent: HttpAgent](https://agent-js.icp.xyz/agent/classes/HttpAgent.html)
   */
  public getInnerAgent(): HttpAgent {
    return this.httpAgent;
  }

  /**
   * Fetch the root key from the IC network.
   * WARNING: This should _NEVER_ be done on mainnet. Only when using a local
   * replica such as DFX or PocketIC.
   *
   * @returns A promise that resolves when the root key has been fetched.
   * @see [@dfinity/agent: fetchRootKey](https://agent-js.icp.xyz/agent/classes/HttpAgent.html#fetchRootKey)
   */
  public async fetchRootKey(): Promise<void> {
    await this.httpAgent.fetchRootKey();
  }

  /**
   * Replaces the current identity used by the inner `HttpAgent` instance
   * to sign requests to canisters.
   *
   * @param identity The identity to replace the current identity with.
   * @see [@dfinity/agent: replaceIdentity](https://agent-js.icp.xyz/agent/classes/HttpAgent.html#replaceIdentity)
   */
  public replaceIdentity(identity: Identity): void {
    this.httpAgent.replaceIdentity(identity);
  }
}

function agentServiceFactory(): IcAgentService {
  const options = inject(IC_AGENT_OPTIONS);

  const httpAgent = HttpAgent.createSync({
    host: options.apiGateway,
    verifyQuerySignatures: options.verifyQuerySignatures,
    retryTimes: options.retryTimes,
    useQueryNonces: options.useQueryNonces,
  });

  return new IcAgentService(httpAgent);
}

async function fetchRootKeyFactory(): Promise<void> {
  const agentService = inject(IcAgentService);
  const options = inject(IC_AGENT_OPTIONS);

  if (options.fetchRootKey) {
    await agentService.fetchRootKey();
  }
}

/**
 * Provides a an instance of {@link IcAgentService} to the Angular DI system.
 * This is a necessary dependency for the {@link IcActorService} and
 * {@link IcAuthService} services.
 *
 * @see {@link IcAgentService}
 * @see {@link IcActorService}
 *
 * @example
 * ```ts
 * import { ApplicationConfig } from '@angular/core';
 * import { provideIcAgent } from '@hadronous/ic-angular';
 * import { environment } from '../environments/environment';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *    provideIcAgent({
 *      apiGateway: environment.API_GATEWAY,
 *      fetchRootKey: !environment.IS_MAINNET,
 *      verifyQuerySignatures: true,
 *      retryTimes: 3,
 *      useQueryNonces: false,
 *    }),
 *  ],
 * };
 * ```
 */
export function provideIcAgent(options: IcAgentOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: IC_AGENT_OPTIONS, useValue: options },
    provideAppInitializer(fetchRootKeyFactory),
  ]);
}
