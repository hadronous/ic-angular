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
import { AuthClient, OnSuccessFunc } from '@dfinity/auth-client';
import { ApplicationInitStatus } from '@angular/core';
import { AnonymousIdentity } from '@dfinity/agent';

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
  const identityMock = createIdentityMock();
  const anonymousIdentity = new AnonymousIdentity();

  beforeEach(() => {
    agentServiceMock = createAgentServiceMock();
    authClientMock = createAuthClientMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: IcAgentService, useValue: agentServiceMock },
        provideIcAuth(authOptionsMock),
      ],
    });

    service = TestBed.inject(IcAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    [true, false].forEach(isAuthenticated => {
      it(`should set the auth client and emit the authentication status (${isAuthenticated})`, async () => {
        await service.init(authClientMock);
        authClientMock.isAuthenticated.and.resolveTo(isAuthenticated);

        const result = await service.isAuthenticated();

        expect(result).toBe(isAuthenticated);
      });
    });
  });

  describe('getIdentity', () => {
    it('should get the current identity', async () => {
      await service.init(authClientMock);
      authClientMock.getIdentity.and.returnValue(identityMock);

      const result = service.getIdentity();
      expect(result).toBe(identityMock);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      let successCallback: OnSuccessFunc | undefined;
      authClientMock.login.and.callFake(async opts => {
        successCallback = opts?.onSuccess;
      });
      authClientMock.isAuthenticated.and.resolveTo(false);
      authClientMock.getIdentity.and.returnValue(anonymousIdentity);

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      isAuthenticatedSpy.calls.reset();
      expect(identitySpy).toHaveBeenCalledWith(anonymousIdentity);
      identitySpy.calls.reset();

      await service.init(authClientMock);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      isAuthenticatedSpy.calls.reset();
      expect(agentServiceMock.replaceIdentity).toHaveBeenCalledOnceWith(
        anonymousIdentity,
      );
      agentServiceMock.replaceIdentity.calls.reset();
      expect(identitySpy).toHaveBeenCalledWith(anonymousIdentity);
      identitySpy.calls.reset();

      const resultPromise = service.login();

      authClientMock.isAuthenticated.and.resolveTo(true);
      authClientMock.getIdentity.and.returnValue(identityMock);

      successCallback?.({
        kind: 'authorize-client-success',
        delegations: [],
        userPublicKey: new Uint8Array(),
        authnMethod: 'passkey',
      });
      await resultPromise;

      expect(authClientMock.login).toHaveBeenCalledOnceWith({
        identityProvider: authOptionsMock.identityProvider,
        maxTimeToLive: authOptionsMock.maxTimeToLive * 1_000_000n,
        derivationOrigin: authOptionsMock.derivationOrigin,
        windowOpenerFeatures: authOptionsMock.windowOpenerFeatures,
        onSuccess: jasmine.any(Function),
        onError: jasmine.any(Function),
      });

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(true);
      expect(agentServiceMock.replaceIdentity).toHaveBeenCalledOnceWith(
        identityMock,
      );
      expect(identitySpy).toHaveBeenCalledOnceWith(identityMock);
    });

    it('should fail login', async () => {
      let errorCallback:
        | ((error?: string | undefined) => void)
        | ((error?: string | undefined) => Promise<void>)
        | undefined;
      authClientMock.login.and.callFake(async opts => {
        errorCallback = opts?.onError;
      });
      authClientMock.isAuthenticated.and.resolveTo(false);
      authClientMock.getIdentity.and.returnValue(anonymousIdentity);

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      isAuthenticatedSpy.calls.reset();
      expect(identitySpy).toHaveBeenCalledWith(anonymousIdentity);
      identitySpy.calls.reset();

      await service.init(authClientMock);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      isAuthenticatedSpy.calls.reset();
      expect(agentServiceMock.replaceIdentity).toHaveBeenCalledOnceWith(
        anonymousIdentity,
      );
      agentServiceMock.replaceIdentity.calls.reset();
      expect(identitySpy).toHaveBeenCalledWith(anonymousIdentity);
      identitySpy.calls.reset();

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

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      isAuthenticatedSpy.calls.reset();
      expect(agentServiceMock.replaceIdentity).toHaveBeenCalledOnceWith(
        anonymousIdentity,
      );
      agentServiceMock.replaceIdentity.calls.reset();
      expect(identitySpy).toHaveBeenCalledWith(anonymousIdentity);
      identitySpy.calls.reset();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      authClientMock.isAuthenticated.and.resolveTo(true);
      authClientMock.getIdentity.and.returnValue(identityMock);
      authClientMock.logout.and.resolveTo();

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      isAuthenticatedSpy.calls.reset();
      expect(identitySpy).toHaveBeenCalledWith(anonymousIdentity);
      identitySpy.calls.reset();

      await service.init(authClientMock);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(true);
      isAuthenticatedSpy.calls.reset();
      expect(agentServiceMock.replaceIdentity).toHaveBeenCalledOnceWith(
        identityMock,
      );
      agentServiceMock.replaceIdentity.calls.reset();
      expect(identitySpy).toHaveBeenCalledOnceWith(identityMock);
      identitySpy.calls.reset();

      authClientMock.isAuthenticated.and.resolveTo(false);
      authClientMock.getIdentity.and.returnValue(anonymousIdentity);
      await service.logout();

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      expect(agentServiceMock.replaceIdentity).toHaveBeenCalledOnceWith(
        anonymousIdentity,
      );
      expect(identitySpy).toHaveBeenCalledOnceWith(anonymousIdentity);
    });
  });

  describe('onIdle', () => {
    it('should auto-logout on idle', async () => {
      const idleManagerMock = createIdleManagerMock();
      authClientMock.idleManager = idleManagerMock;

      let onIdleCallback: (() => Promise<void>) | undefined;
      idleManagerMock.registerCallback.and.callFake(onIdle => {
        onIdleCallback = onIdle as () => Promise<void>;
      });
      authClientMock.isAuthenticated.and.resolveTo(true);
      authClientMock.getIdentity.and.returnValue(identityMock);

      const isAuthenticatedSpy = jasmine.createSpy('isAuthenticated');
      const identitySpy = jasmine.createSpy('identity');
      const onIdleSpy = jasmine.createSpy('onIdle');
      service.isAuthenticated$.subscribe(isAuthenticatedSpy);
      service.identity$.subscribe(identitySpy);
      service.onIdle$.subscribe(onIdleSpy);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      isAuthenticatedSpy.calls.reset();
      expect(identitySpy).toHaveBeenCalledWith(anonymousIdentity);
      identitySpy.calls.reset();
      expect(onIdleSpy).not.toHaveBeenCalled();

      await service.init(authClientMock);

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(true);
      isAuthenticatedSpy.calls.reset();
      expect(identitySpy).toHaveBeenCalledOnceWith(identityMock);
      identitySpy.calls.reset();

      authClientMock.isAuthenticated.and.resolveTo(false);
      authClientMock.getIdentity.and.returnValue(anonymousIdentity);
      await onIdleCallback?.();

      expect(isAuthenticatedSpy).toHaveBeenCalledOnceWith(false);
      expect(identitySpy).toHaveBeenCalledOnceWith(anonymousIdentity);
      expect(onIdleSpy).toHaveBeenCalledOnceWith(undefined);
    });
  });
});

describe('IcAuthService (with TestBed)', () => {
  let agentServiceMock: AgentServiceMock;
  let authServiceMock: AuthServiceMock;

  beforeEach(() => {
    authServiceMock = createAuthServiceMock();
    agentServiceMock = createAgentServiceMock();

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

    expect(authServiceMock.init).toHaveBeenCalledOnceWith(
      jasmine.any(AuthClient),
    );
  });
});
