import { HttpAgent } from '@dfinity/agent';
import { IcAgentService } from './agent.service';

export type HttpAgentMock = jasmine.SpyObj<HttpAgent>;

export type AgentServiceMock = jasmine.SpyObj<IcAgentService>;

export function createHttpAgentMock(): HttpAgentMock {
  return jasmine.createSpyObj<HttpAgent>('HttpAgent', [
    'getPrincipal',
    'createReadStateRequest',
    'readState',
    'call',
    'status',
    'query',
    'fetchRootKey',
    'invalidateIdentity',
    'replaceIdentity',
  ]);
}

export function createAgentServiceMock(): AgentServiceMock {
  return jasmine.createSpyObj<IcAgentService>('IcAgentService', [
    'getInnerAgent',
    'fetchRootKey',
    'replaceIdentity',
  ]);
}
