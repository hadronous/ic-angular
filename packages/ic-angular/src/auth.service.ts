import {
  EnvironmentProviders,
  Inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { Identity, SignIdentity } from '@dfinity/agent';
import { AuthClient, AuthClientCreateOptions } from '@dfinity/auth-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { IcAgentService } from './agent.service';

@Injectable({ providedIn: 'root' })
export class IcAuthService {
  private onIdleSubject = new Subject<void>();
  public onIdle$ = this.onIdleSubject.asObservable();

  private identitySubject = new BehaviorSubject<Identity | null>(null);
  public identity$ = this.identitySubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private authClient: AuthClient | undefined;
  private authClientPromise: Promise<AuthClient> | undefined;

  constructor(
    @Inject(IC_AUTH_OPTIONS)
    private readonly options: IcAuthOptions,
    private readonly agentService: IcAgentService,
  ) {}

  public async isAuthenticated(): Promise<boolean> {
    const authClient = await this.getAuthClient(this.options);

    return await authClient.isAuthenticated();
  }

  public async getIdentity(): Promise<Identity | undefined> {
    const authClient = await this.getAuthClient(this.options);

    return authClient.getIdentity();
  }

  public async login(): Promise<void> {
    const authClient = await this.getAuthClient(this.options);

    await new Promise<void>((resolve, reject) => {
      authClient.login({
        identityProvider: this.options.identityProvider,
        maxTimeToLive: this.options.maxTimeToLive,
        derivationOrigin: this.options.derivationOrigin,
        windowOpenerFeatures: this.options.windowOpenerFeatures,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          this.agentService.replaceIdentity(identity);
          this.isAuthenticatedSubject.next(true);
          this.identitySubject.next(identity);

          return resolve();
        },
        onError: err => {
          this.isAuthenticatedSubject.next(false);
          this.identitySubject.next(null);

          return reject(err);
        },
      });
    });
  }

  public async logout(): Promise<void> {
    const authClient = await this.getAuthClient(this.options);

    await authClient.logout();

    this.isAuthenticatedSubject.next(false);
    this.identitySubject.next(null);
  }

  private async getAuthClient(options: IcAuthOptions): Promise<AuthClient> {
    if (this.authClient) {
      return this.authClient;
    }

    if (this.authClientPromise) {
      return this.authClientPromise;
    }

    this.authClientPromise = AuthClient.create({
      identity: options.identity,
      storage: options.storage,
      keyType: options.keyType,
      idleOptions: {
        captureScroll: options.idlOptions?.captureScroll,
        disableIdle: options.idlOptions?.disableIdle,
        idleTimeout: options.idlOptions?.idleTimeout,
        scrollDebounce: options.idlOptions?.scrollDebounce,
        disableDefaultIdleCallback: true,
        onIdle: this.onIdleCallback.bind(this),
      },
    });
    this.authClient = await this.authClientPromise;

    return this.authClient;
  }

  private async onIdleCallback(): Promise<void> {
    // AuthClient is auto-logging out, even though the default idle callback is disabled
    // [TODO] - remove this once the issue is fixed
    this.isAuthenticatedSubject.next(false);
    this.identitySubject.next(null);

    this.onIdleSubject.next();
  }
}

type AuthClientStorage = AuthClientCreateOptions['storage'];
type BaseKeyType = AuthClientCreateOptions['keyType'];

export interface IcAuthOptions {
  identity?: SignIdentity;
  storage?: AuthClientStorage;
  keyType?: BaseKeyType;
  identityProvider?: string | URL;
  maxTimeToLive?: bigint;
  derivationOrigin?: string | URL;
  windowOpenerFeatures?: string;
  idlOptions?: {
    captureScroll?: boolean;
    disableIdle?: boolean;
    idleTimeout?: number;
    scrollDebounce?: number;
  };
}

export const IC_AUTH_OPTIONS = new InjectionToken<IcAuthOptions>(
  'IC_AUTH_OPTIONS',
);

export function provideIcAuth(options?: IcAuthOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    IcAuthService,
    { provide: IC_AUTH_OPTIONS, useValue: options },
  ]);
}
