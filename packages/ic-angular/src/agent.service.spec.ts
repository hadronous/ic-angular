import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Identity } from '@dfinity/agent';
import {
  AgentServiceMock,
  HttpAgentMock,
  createAgentServiceMock,
  createHttpAgentMock,
} from './agent.service.mock';
import {
  IC_AGENT_OPTIONS,
  IcAgentService,
  provideIcAgent,
} from './agent.service';

describe('IcAgentService', () => {
  let service: IcAgentService;
  let httpAgentMock: HttpAgentMock;

  beforeEach(() => {
    httpAgentMock = createHttpAgentMock();

    service = new IcAgentService(httpAgentMock);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
    expect(service).toBeInstanceOf(IcAgentService);
  });

  describe('innerAgent', () => {
    it('should return the inner agent', () => {
      const result = service.getInnerAgent();

      expect(result).toBe(httpAgentMock);
    });
  });

  describe('fetchRootKey', () => {
    it('should call the inner agent', async () => {
      await service.fetchRootKey();

      expect(httpAgentMock.fetchRootKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('replaceIdentity', () => {
    it('should call the inner agent', () => {
      const identity = jasmine.createSpyObj<Identity>('Identity', [
        'getPrincipal',
      ]);

      service.replaceIdentity(identity);

      expect(httpAgentMock.replaceIdentity).toHaveBeenCalledOnceWith(identity);
    });
  });
});

describe('IcAgentService (with TestBed)', () => {
  let agentServiceMock: AgentServiceMock;

  beforeEach(() => {
    agentServiceMock = createAgentServiceMock();

    TestBed.configureTestingModule({
      providers: [provideIcAgent({})],
    });
  });

  it('should create', () => {
    const result = TestBed.inject(IcAgentService);

    expect(result).toBeTruthy();
    expect(result).toBeInstanceOf(IcAgentService);
  });

  it('should not fetch root key', async () => {
    TestBed.overrideProvider(IcAgentService, { useValue: agentServiceMock });
    TestBed.overrideProvider(IC_AGENT_OPTIONS, {
      useValue: { fetchRootKey: false },
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(agentServiceMock.fetchRootKey).not.toHaveBeenCalled();
  });

  it('should fetch root key', async () => {
    TestBed.overrideProvider(IcAgentService, { useValue: agentServiceMock });
    TestBed.overrideProvider(IC_AGENT_OPTIONS, {
      useValue: { fetchRootKey: true },
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(agentServiceMock.fetchRootKey).toHaveBeenCalledTimes(1);
  });
});
