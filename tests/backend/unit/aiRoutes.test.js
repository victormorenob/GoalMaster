// tests/backend/unit/aiRoutes.test.js
jest.mock('http');

const http = require('http');
const { Readable } = require('stream');
const aiController = require('@/api/controllers/aiController');

function mockHttpResponse(responseData) {
  http.request.mockImplementation((options, callback) => {
    const body = JSON.stringify(responseData);
    const res = new Readable();
    res.push(body);
    res.push(null);
    setImmediate(() => callback(res));
    return { write: jest.fn(), end: jest.fn(), on: jest.fn() };
  });
}

function mockHttpError(errorMessage) {
  http.request.mockImplementation(() => {
    const req = {
      write: jest.fn(),
      end: jest.fn(),
      on: (event, handler) => {
        if (event === 'error') {
          setImmediate(() => handler(new Error(errorMessage)));
        }
      },
    };
    return req;
  });
}

describe('AI Controller — Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if message is missing', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await aiController.chat(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'A valid "message" field is required.',
    });
  });

  it('should return 400 if message is not a string', async () => {
    const req = { body: { message: 123 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await aiController.chat(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should call Ollama and return the response', async () => {
    mockHttpResponse({ message: { content: 'Hello! How can I help you?' } });

    const req = { body: { message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await aiController.chat(req, res, next);

    expect(http.request).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: { response: 'Hello! How can I help you?' },
    });
  });

  it('should handle Ollama errors gracefully', async () => {
    mockHttpError('Connection refused');

    const req = { body: { message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await aiController.chat(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('AI Controller — Suggest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return suggestions even without context', async () => {
    mockHttpResponse({ message: { content: 'Focus on high-priority objectives first.' } });

    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await aiController.suggest(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: { suggestions: 'Focus on high-priority objectives first.' },
    });
  });

  it('should include context when provided', async () => {
    mockHttpResponse({ message: { content: 'Your objectives are well-structured.' } });

    const req = { body: { context: 'User has 5 active objectives.' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await aiController.suggest(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: { suggestions: 'Your objectives are well-structured.' },
    });
  });
});
