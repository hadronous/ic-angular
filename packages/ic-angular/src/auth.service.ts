import {
  APP_INITIALIZER,
  EnvironmentProviders,
  Inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { AnonymousIdentity, Identity, SignIdentity } from '@dfinity/agent';
import { AuthClient, AuthClientCreateOptions } from '@dfinity/auth-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { IcAgentService } from './agent.service';

const MS_PER_NS = 1_000_000n;

const anonymousIdentity = new AnonymousIdentity();

/**
 * An Angular-native service that provides a wrapper around the `AuthClient`
 * class from the `@dfinity/auth-client` library.
 */
@Injectable({ providedIn: 'root' })
export class IcAuthService {
  private onIdleSubject = new Subject<void>();
  /**
   * An observable that emits when the user is idle.
   */
  public onIdle$ = this.onIdleSubject.asObservable();

  private identitySubject = new BehaviorSubject<Identity>(anonymousIdentity);
  /**
   * An observable that emits the current identity.
   */
  public identity$ = this.identitySubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  /**
   * An observable that emits whether the user is currently logged in.
   */
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private authClient: AuthClient | undefined;

  /**
   * @private
   */
  constructor(
    @Inject(IC_AUTH_OPTIONS)
    private readonly options: IcAuthOptions,
    private readonly agentService: IcAgentService,
  ) {}

  /**
   * Sets the inner auth client to be used by this service.
   * Should not be called directly. This is handled by {@link provideIcAuth}.
   *
   * @private
   */
  public async init(authClient: AuthClient): Promise<void> {
    this.authClient = authClient;
    this.authClient.idleManager?.registerCallback(
      this.onIdleCallback.bind(this),
    );

    await this.syncAuthState();
  }

  /**
   * Checks whether the user is currently logged in.
   *
   * @returns A boolean to indicate whether the user is currently logged in.
   */
  public async isAuthenticated(): Promise<boolean> {
    const authClient = this.getAuthClient();

    return await authClient.isAuthenticated();
  }

  /**
   * Gets the current identity.
   *
   * @returns The identity of the current user. This is an anonymous identity
   * if there is no user currently logged in.
   */
  public getIdentity(): Identity {
    const authClient = this.getAuthClient();

    return authClient.getIdentity();
  }

  /**
   * Logs in the user by opening a window to the identity provider.
   * The user will be redirected back to the current page after logging in.
   *
   * @returns A promise that resolves when the user is logged in,
   * or throws if authentication fails.
   */
  public async login(): Promise<void> {
    const authClient = this.getAuthClient();
    const maxTimeToLive = this.options.maxTimeToLive
      ? this.options.maxTimeToLive * MS_PER_NS
      : undefined;

    await new Promise<void>((resolve, reject) => {
      authClient.login({
        identityProvider: this.options.identityProvider,
        maxTimeToLive,
        derivationOrigin: this.options.derivationOrigin,
        windowOpenerFeatures: this.options.windowOpenerFeatures,
        onSuccess: async () => {
          await this.syncAuthState();

          return resolve();
        },
        onError: async err => {
          await this.syncAuthState();

          return reject(err);
        },
      });
    });
  }

  /**
   * Logs out the user by deleting any authorized delegations in storage.
   *
   * @returns A promise that resolves when the user is logged out.
   */
  public async logout(): Promise<void> {
    const authClient = this.getAuthClient();

    await authClient.logout();
    await this.syncAuthState();
  }

  private getAuthClient(): AuthClient {
    if (!this.authClient) {
      throw new Error('AuthClient is not initialized');
    }

    return this.authClient;
  }

  private async onIdleCallback(): Promise<void> {
    // AuthClient is auto-logging out, even though the default idle callback is disabled
    // [TODO] - remove this once the issue is fixed
    await this.logout();

    this.onIdleSubject.next();
  }

  private async syncAuthState(): Promise<void> {
    const authClient = this.getAuthClient();
    const isAuthenticated = await authClient.isAuthenticated();
    const identity = authClient.getIdentity();

    this.agentService.replaceIdentity(identity);
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.identitySubject.next(identity);
  }
}

type AuthClientStorage = AuthClientCreateOptions['storage'];
type BaseKeyType = AuthClientCreateOptions['keyType'];

/**
 * Options for providing the {@link IcAuthService} using {@link provideIcAuth}.
 */
export interface IcAuthOptions {
  /**
   * A default identity to use for authentication.
   * The auth client will use this identity if the user is not logged in.
   * If this is not provided, the auth client will use an anonymous identity.
   *
   * @see [@dfinity/auth-client: identity](https://agent-js.icp.xyz/auth-client/interfaces/AuthClientCreateOptions.html#identity)
   */
  identity?: SignIdentity;

  /**
   * An alternative storage to use for credentials.
   * [IdbStorage](https://agent-js.icp.xyz/auth-client/classes/IdbStorage.html)
   * is used by default.
   *
   * @see [@dfinity/auth-client: storage](https://agent-js.icp.xyz/auth-client/interfaces/AuthClientCreateOptions.html#storage)
   */
  storage?: AuthClientStorage;

  /**
   * The type of key to use for authentication. The default is `'ECDSA'`.
   * Use `'Ed25519'` if you are using a custom storage provider that does
   * not support CryptoKey storage.
   *
   * @see [@dfinity/auth-client: keyType](https://agent-js.icp.xyz/auth-client/interfaces/AuthClientCreateOptions.html#keyType)
   */
  keyType?: BaseKeyType;

  /**
   * The URL of the identity provider to use for authentication.
   * Defaults to `'https://identity.ic0.app'`.
   *
   * @see [@dfinity/auth-client: identityProvider](https://agent-js.icp.xyz/auth-client/interfaces/AuthClientLoginOptions.html#identityProvider)
   */
  identityProvider?: string | URL;

  /**
   * The maximum time to live for a authorized delegation in milliseconds.
   *
   * @see [@dfinity/auth-client: maxTimeToLive](https://agent-js.icp.xyz/auth-client/interfaces/AuthClientLoginOptions.html#maxTimeToLive)
   */
  maxTimeToLive?: bigint;

  /**
   * Origin to use when generating a delegation.
   *
   * @see [@dfinity/auth-client: derivationOrigin](https://agent-js.icp.xyz/auth-client/interfaces/AuthClientLoginOptions.html#derivationOrigin)
   * @see [Alternative Frontend Origins](https://internetcomputer.org/docs/current/references/ii-spec#alternative-frontend-origins)
   */
  derivationOrigin?: string | URL;

  /**
   * Window opener features to use when opening the identity provider's
   * window.
   *
   * @see [@dfinity/auth-client: windowOpenerFeatures](https://agent-js.icp.xyz/auth-client/interfaces/AuthClientLoginOptions.html#windowOpenerFeatures)
   * @see [Window.open()](https://developer.mozilla.org/en-US/docs/Web/API/Window/open#windowfeatures)
   */
  windowOpenerFeatures?: string;

  /**
   * Options for configuring the agent-js idle manager.
   *
   * @see [@dfinity/auth-client: idleOptions](https://agent-js.icp.xyz/auth-client/interfaces/IdleOptions.html)
   */
  idlOptions?: {
    /**
     * Whether to capture scroll events when calculating idle time.
     *
     * @see [@dfinity/auth-client: captureScroll](https://agent-js.icp.xyz/auth-client/interfaces/IdleOptions.html#captureScroll)
     */
    captureScroll?: boolean;

    /**
     * Whether to disable idle detection entirely.
     *
     * @see [@dfinity/auth-client: disableIdle](https://agent-js.icp.xyz/auth-client/interfaces/IdleOptions.html#disableIdle)
     */
    disableIdle?: boolean;

    /**
     * How long to wait before considering the user idle in milliseconds.
     *
     * @see [@dfinity/auth-client: idleTimeout](https://agent-js.icp.xyz/auth-client/interfaces/IdleOptions.html#idleTimeout)
     */
    idleTimeout?: number;

    /**
     * Debounce scroll events by this amount in milliseconds.
     *
     * @see [@dfinity/auth-client: scrollDebounce](https://agent-js.icp.xyz/auth-client/interfaces/IdleOptions.html#scrollDebounce)
     */
    scrollDebounce?: number;
  };
}

const IC_AUTH_OPTIONS = new InjectionToken<IcAuthOptions>('IC_AUTH_OPTIONS');

function setAuthClientFactory(
  authService: IcAuthService,
  options: IcAuthOptions,
): () => Promise<void> {
  return async () => {
    const authClient = await AuthClient.create({
      identity: options.identity,
      storage: options.storage,
      keyType: options.keyType,
      idleOptions: {
        captureScroll: options.idlOptions?.captureScroll,
        disableIdle: options.idlOptions?.disableIdle,
        idleTimeout: options.idlOptions?.idleTimeout,
        scrollDebounce: options.idlOptions?.scrollDebounce,
        disableDefaultIdleCallback: true,
      },
    });

    await authService.init(authClient);
  };
}

/**
 * Provides an instance of {@link IcAuthService} to the Angular DI system.
 * Depends on {@link IcAgentService}.
 *
 * @see {@link IcAgentService}
 * @see {@link provideIcAgent}
 *
 * @example
 * ```ts
 * import { ApplicationConfig, Injectable } from '@angular/core';
 * import { provideIcAgent, provideIcAuth } from '@hadronous/ic-angular';
 * import { environment } from '../environments/environment';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *    provideIcAgent({
 *      apiGateway: environment.API_GATEWAY,
 *      fetchRootKey: !environment.IS_MAINNET,
 *    }),
 *    provideIcAuth({
 *      identityProvider: environment.IDENTITY_PROVIDER,
 *      idlOptions: { idleTimeout: 1_000 * 60 }, // 1 minute
 *      maxTimeToLive: BigInt(1_000 * 2), // 2 seconds
 *    }),
 *  ],
 * };
 * ```
 */
export function provideIcAuth(options?: IcAuthOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    IcAuthService,
    { provide: IC_AUTH_OPTIONS, useValue: options },
    {
      provide: APP_INITIALIZER,
      useFactory: setAuthClientFactory,
      deps: [IcAuthService, IC_AUTH_OPTIONS],
      multi: true,
    },
  ]);
}
