import {
  ActorMethod,
  ApiQueryResponse,
  QueryCallRejectedError,
  QueryResponseStatus,
  ReplicaRejectCode,
  RequestId,
} from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { createActorService } from './actor.service';
import {
  HttpAgentMock,
  AgentServiceMock,
  createAgentServiceMock,
  createHttpAgentMock,
} from './agent.service.mock';

describe('createActorService', () => {
  interface TestActor {
    say_hello: ActorMethod<[], string>;
    set_greeting: ActorMethod<[string], string>;
  }

  const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
    return IDL.Service({
      say_hello: IDL.Func([], [IDL.Text], ['query']),
    });
  };

  const canisterId = Principal.fromUint8Array(new Uint8Array([0]));

  class TestActorService extends createActorService<TestActor>({
    idlFactory,
    canisterId,
  }) {}

  let service: TestActorService;
  let httpAgentMock: HttpAgentMock;
  let agentServiceMock: AgentServiceMock;

  beforeEach(() => {
    httpAgentMock = createHttpAgentMock();
    agentServiceMock = createAgentServiceMock();
    agentServiceMock.getInnerAgent.and.returnValue(httpAgentMock);

    service = new TestActorService(agentServiceMock);
  });

  it('should forward to the agent and return response to the caller', async () => {
    const response: ApiQueryResponse = {
      status: QueryResponseStatus.Replied,
      httpDetails: {
        headers: [],
        ok: true,
        status: 200,
        statusText: 'OK',
      },
      requestId: new Uint8Array([0]) as unknown as RequestId,
      reply: {
        arg: IDL.encode([IDL.Text], ['Hello']),
      },
    };
    httpAgentMock.query.and.resolveTo(response);

    const result = await service.say_hello();

    expect(httpAgentMock.query).toHaveBeenCalled();
    expect(result).toEqual('Hello');
  });

  it('should forward to the agent and return error to the caller', async () => {
    const response: ApiQueryResponse = {
      status: QueryResponseStatus.Rejected,
      httpDetails: {
        headers: [],
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      },
      requestId: new Uint8Array([0]) as unknown as RequestId,
      reject_code: ReplicaRejectCode.DestinationInvalid,
      error_code: 'DestinationInvalid',
      reject_message: 'Canister ID does not exist',
    };
    httpAgentMock.query.and.resolveTo(response);

    await expectAsync(service.say_hello()).toBeRejectedWith(
      new QueryCallRejectedError(canisterId, 'say_hello', response),
    );
  });
});
