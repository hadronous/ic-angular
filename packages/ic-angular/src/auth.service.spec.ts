import { TestBed } from '@angular/core/testing';
import { IcAuthOptions, IcAuthService, provideIcAuth } from './auth.service';
import { IcAgentService } from './agent.service';
import { AgentServiceMock, createAgentServiceMock } from './agent.service.mock';
import {
  AuthClientMock,
  AuthServiceMock,
  createAuthClientMock,
  createAuthServiceMock,
  createIdentityMock,
  createIdleManagerMock,
} from './auth.service.mock';
import { AuthClient } from '@dfinity/auth-client';
import { ApplicationInitStatus } from '@angular/core';

type MockAuthOptions = Required<Omit<IcAuthOptions, 'identity' | 'storage'>>;

describe('IcAuthService', () => {
  let service: IcAuthService;
  let agentServiceMock: AgentServiceMock;
  let authClientMock: AuthClientMock;

  const authOptionsMock: MockAuthOptions = {
    identityProvider: 'https://identity.ic0.app',
    maxTimeToLive: 1_000n,
    derivationOrigin: 'https://example.org',
    windowOpenerFeatures: 'width=100,height=100',
    idlOptions: {},
    keyType: 'Ed25519',
  };

  beforeEach(() => {
    agentServiceMock = createAgentServiceMock();
    authClientMock = createAuthClientMock();

    service = new IcAuthService(authOptionsMock, agentServiceMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    [true, false].forEach(isAuthenticated => {
      it(`should set the auth client and emit the authentication status (${isAuthenticated})`, async () => {
        service.setAuthClient(authClientMock);
        authClientMock.isAuthenticated.and.returnValue(
          Promise.resolve(isAuthenticated),
        );

        const result = await service.isAuthenticated();
        expect(result).toBe(isAuthenticated);
      });
    });
  });

  describe('getIdentity', () => {
    it('should get the current identity', () => {
      service.setAuthClient(authClientMock);
      const identityMock = createIdentityMock();
      authClientMock.getIdentity.and.returnValue(identityMock);

      const result = service.getIdentity();
      expect(result).toBe(identityMock);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      service.setAuthClient(authClientMock);
      let successCallback: (() => void) | (() => Promise<void>) | undefined;
      authClientMock.login.and.callFake(async opts => {
        successCallback = opts?.onSuccess;
      });

      const identityMock = createIdentityMock();
      authClientMock.getIdentity.and.returnValue(identityMock);

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      expect(identitySpy).toHaveBeenCalledWith(null);

      const resultPromise = service.login();
      successCallback?.();
      await resultPromise;

      expect(authClientMock.login).toHaveBeenCalledOnceWith({
        identityProvider: authOptionsMock.identityProvider,
        maxTimeToLive: authOptionsMock.maxTimeToLive * 1_000_000n,
        derivationOrigin: authOptionsMock.derivationOrigin,
        windowOpenerFeatures: authOptionsMock.windowOpenerFeatures,
        onSuccess: jasmine.any(Function),
        onError: jasmine.any(Function),
      });

      expect(isAuthenticatedSpy).toHaveBeenCalledTimes(2);
      expect(isAuthenticatedSpy).toHaveBeenCalledWith(true);
      expect(agentServiceMock.replaceIdentity).toHaveBeenCalledOnceWith(
        identityMock,
      );
      expect(identitySpy).toHaveBeenCalledTimes(2);
      expect(identitySpy).toHaveBeenCalledWith(identityMock);
    });

    it('should fail login', async () => {
      service.setAuthClient(authClientMock);
      let errorCallback:
        | ((error?: string | undefined) => void)
        | ((error?: string | undefined) => Promise<void>)
        | undefined;
      authClientMock.login.and.callFake(async opts => {
        errorCallback = opts?.onError;
      });

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      expect(identitySpy).toHaveBeenCalledWith(null);

      const error = 'Login failed';
      const resultPromise = service.login();
      errorCallback?.(error);

      await expectAsync(resultPromise).toBeRejectedWith(error);

      expect(authClientMock.login).toHaveBeenCalledOnceWith({
        identityProvider: authOptionsMock.identityProvider,
        maxTimeToLive: authOptionsMock.maxTimeToLive * 1_000_000n,
        derivationOrigin: authOptionsMock.derivationOrigin,
        windowOpenerFeatures: authOptionsMock.windowOpenerFeatures,
        onSuccess: jasmine.any(Function),
        onError: jasmine.any(Function),
      });

      expect(isAuthenticatedSpy).toHaveBeenCalledTimes(2);
      expect(isAuthenticatedSpy).toHaveBeenCalledWith(false);
      expect(agentServiceMock.replaceIdentity).not.toHaveBeenCalled();
      expect(identitySpy).toHaveBeenCalledTimes(2);
      expect(identitySpy).toHaveBeenCalledWith(null);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      service.setAuthClient(authClientMock);
      authClientMock.logout.and.resolveTo();

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      expect(identitySpy).toHaveBeenCalledWith(null);

      await service.logout();

      expect(isAuthenticatedSpy).toHaveBeenCalledTimes(2);
      expect(isAuthenticatedSpy).toHaveBeenCalledWith(false);
      expect(identitySpy).toHaveBeenCalledTimes(2);
      expect(identitySpy).toHaveBeenCalledWith(null);
    });
  });

  describe('onIdle', () => {
    it('should auto-logout on idle', async () => {
      const idleManagerMock = createIdleManagerMock();
      authClientMock.idleManager = idleManagerMock;

      let onIdleCallback: (() => void) | undefined;
      idleManagerMock.registerCallback.and.callFake(onIdle => {
        onIdleCallback = onIdle;
      });

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      const onIdleSpy = jasmine.createSpy('onIdle');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);
      service.onIdle$.subscribe(onIdleSpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      expect(identitySpy).toHaveBeenCalledWith(null);
      expect(onIdleSpy).not.toHaveBeenCalled();

      service.setAuthClient(authClientMock);

      onIdleCallback?.();

      expect(isAuthenticatedSpy).toHaveBeenCalledTimes(2);
      expect(isAuthenticatedSpy).toHaveBeenCalledWith(false);
      expect(identitySpy).toHaveBeenCalledTimes(2);
      expect(identitySpy).toHaveBeenCalledWith(null);
      expect(onIdleSpy).toHaveBeenCalledOnceWith(undefined);
    });
  });
});

describe('IcAuthService (with TestBed)', () => {
  let agentServiceMock: AgentServiceMock;
  let authServiceMock: AuthServiceMock;

  beforeEach(() => {
    authServiceMock = createAuthServiceMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: IcAgentService, useValue: agentServiceMock },
        provideIcAuth({}),
      ],
    });
  });

  it('should create', () => {
    const result = TestBed.inject(IcAuthService);

    expect(result).toBeTruthy();
    expect(result).toBeInstanceOf(IcAuthService);
  });

  it('should create and set an auth client', async () => {
    TestBed.overrideProvider(IcAuthService, { useValue: authServiceMock });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(authServiceMock.setAuthClient).toHaveBeenCalledOnceWith(
      jasmine.any(AuthClient),
    );
  });
});
