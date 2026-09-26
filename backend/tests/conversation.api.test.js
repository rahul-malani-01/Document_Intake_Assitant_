import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { setLLMServiceInstance } from '../src/services/llm/llm.factory.js';
import { MockLLMService } from '../src/services/llm/mock-llm.service.js';

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/document_intake_test';

describe('Conversation API Integration Flow', () => {
  let mockLLM;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
    mockLLM = new MockLLMService();
    setLLMServiceInstance(mockLLM);
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
  });

  it('Creates a session, persists initial message, and returns blank canonical state', async () => {
    const res = await request(app).post('/api/sessions').expect(201);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.state.full_name).toBeNull();
    expect(res.body.assistantMessage).toContain('What is your full name?');
  });

  it('Extracts single field via conversational turn', async () => {
    const createRes = await request(app).post('/api/sessions').expect(201);
    const sessionId = createRes.body.sessionId;

    const msgRes = await request(app)
      .post(`/api/sessions/${sessionId}/messages`)
      .send({ message: 'My name is Rahul Malani' })
      .expect(200);

    expect(msgRes.body.state.full_name).toBe('Rahul Malani');
    expect(msgRes.body.assistantMessage).toContain('Nagpur');
    expect(msgRes.body.document).toContain('Rahul Malani');
  });

  it('Handles multiple fields in a single message', async () => {
    const createRes = await request(app).post('/api/sessions').expect(201);
    const sessionId = createRes.body.sessionId;

    const msgRes = await request(app)
      .post(`/api/sessions/${sessionId}/messages`)
      .send({
        message: "I'm Rahul Malani, I live in Nagpur, I have two children Aarav and Riya, and my brother James is my executor"
      })
      .expect(200);

    expect(msgRes.body.state.full_name).toBe('Rahul Malani');
    expect(msgRes.body.state.home_address).toBe('Nagpur');
    expect(msgRes.body.state.has_children).toBe(true);
    expect(msgRes.body.state.children).toEqual(['Aarav', 'Riya']);
    expect(msgRes.body.state.executor.name).toBe('James');
    expect(msgRes.body.state.executor.relationship).toBe('brother');
  });

  it('Rejects malformed LLM response without corrupting state', async () => {
    const createRes = await request(app).post('/api/sessions').expect(201);
    const sessionId = createRes.body.sessionId;

    // Simulate LLM returning malformed payload
    mockLLM.setFixture({ invalid_structure: 12345 });

    const errorRes = await request(app)
      .post(`/api/sessions/${sessionId}/messages`)
      .send({ message: 'Hello assistant' })
      .expect(500);

    expect(errorRes.body.error).toBeDefined();

    // Verify database state remains uncorrupted
    const verifyRes = await request(app).get(`/api/sessions/${sessionId}`).expect(200);
    expect(verifyRes.body.state.full_name).toBeNull();

    mockLLM.clearFixture();
  });
});