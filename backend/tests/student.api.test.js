import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Student } from '../models/Student.js';
import { startTestServer, request } from './helpers/testServer.js';

dotenv.config();

const TEST_URI =
  process.env.MONGODB_URI_TEST ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/sqe_students_test';

describe('Student CRUD API', { concurrency: 1 }, () => {
  /** @type {{ baseUrl: string; close: () => Promise<void> }} */
  let testServer;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB(TEST_URI);
    }
    await Student.deleteMany({});
    testServer = await startTestServer();
  });

  after(async () => {
    if (testServer) {
      await testServer.close();
    }
    await Student.deleteMany({});
    await disconnectDB();
  });

  it('POST /api/students creates a student (201)', async () => {
    const { status, body } = await request(testServer.baseUrl, '/api/students', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Shahbaz Raza',
        rollNo: 'K22SW035',
        department: 'Software Engineering',
        semester: 8,
      }),
    });

    assert.equal(status, 201);
    assert.equal(body.success, true);
    assert.ok(body.data._id);
    assert.equal(body.data.name, 'Shahbaz Raza');
    assert.equal(body.data.rollNo, 'K22SW035');
  });

  it('GET /api/students returns all students (200)', async () => {
    const { status, body } = await request(testServer.baseUrl, '/api/students');
    assert.equal(status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });

  it('GET /api/students/:id returns one student (200)', async () => {
    const created = await Student.findOne({ rollNo: 'K22SW035' });
    const { status, body } = await request(
      testServer.baseUrl,
      `/api/students/${created._id}`
    );
    assert.equal(status, 200);
    assert.equal(body.data.rollNo, 'K22SW035');
  });

  it('PUT /api/students/:id updates a student (200)', async () => {
    const created = await Student.findOne({ rollNo: 'K22SW035' });
    const { status, body } = await request(
      testServer.baseUrl,
      `/api/students/${created._id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ semester: 7 }),
      }
    );
    assert.equal(status, 200);
    assert.equal(body.data.semester, 7);
  });

  it('DELETE /api/students/:id deletes a student (200)', async () => {
    const created = await Student.findOne({ rollNo: 'K22SW035' });
    const { status, body } = await request(
      testServer.baseUrl,
      `/api/students/${created._id}`,
      { method: 'DELETE' }
    );
    assert.equal(status, 200);
    assert.equal(body.success, true);

    const { status: getStatus } = await request(
      testServer.baseUrl,
      `/api/students/${created._id}`
    );
    assert.equal(getStatus, 404);
  });

  it('POST with missing fields returns 400', async () => {
    const { status, body } = await request(testServer.baseUrl, '/api/students', {
      method: 'POST',
      body: JSON.stringify({ name: 'Only Name' }),
    });
    assert.equal(status, 400);
    assert.equal(body.success, false);
  });

  it('POST with invalid semester returns 400', async () => {
    const { status, body } = await request(testServer.baseUrl, '/api/students', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        rollNo: 'K26INVALID',
        department: 'Software Engineering',
        semester: 99,
      }),
    });
    assert.equal(status, 400);
    assert.equal(body.success, false);
  });

  it('POST duplicate roll number returns 409', async () => {
    await request(testServer.baseUrl, '/api/students', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Student A',
        rollNo: 'K26DUP001',
        department: 'Software Engineering',
        semester: 1,
      }),
    });
    const { status, body } = await request(testServer.baseUrl, '/api/students', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Student B',
        rollNo: 'K26DUP001',
        department: 'Software Engineering',
        semester: 2,
      }),
    });
    assert.equal(status, 409);
    assert.equal(body.success, false);
  });

  it('GET with malformed id returns 400', async () => {
    const { status, body } = await request(testServer.baseUrl, '/api/students/not-an-id');
    assert.equal(status, 400);
    assert.equal(body.success, false);
  });

  it('GET with valid but nonexistent id returns 404', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const { status, body } = await request(testServer.baseUrl, `/api/students/${fakeId}`);
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });

  it('PUT nonexistent student returns 404', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const { status, body } = await request(testServer.baseUrl, `/api/students/${fakeId}`, {
      method: 'PUT',
      body: JSON.stringify({ semester: 3 }),
    });
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });

  it('DELETE nonexistent student returns 404', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const { status, body } = await request(testServer.baseUrl, `/api/students/${fakeId}`, {
      method: 'DELETE',
    });
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });

  it('GET unknown route returns 404', async () => {
    const { status, body } = await request(testServer.baseUrl, '/api/unknown');
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });
});
