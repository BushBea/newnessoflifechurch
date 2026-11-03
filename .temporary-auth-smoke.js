const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');

process.chdir(__dirname);
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/db');

const port = '4123';
const origin = 'http://localhost:5500';
const baseUrl = `http://127.0.0.1:${port}`;
const memberEmail = `auth-smoke-${randomUUID()}@example.com`;
const server = spawn(process.execPath, ['server.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT: port },
  stdio: 'ignore',
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch (_) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error('Backend did not start.');
}

async function request(pathname, { method = 'GET', body, cookie } = {}) {
  const headers = { origin };
  if (body) headers['content-type'] = 'application/json';
  if (cookie) headers.cookie = cookie;
  return fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function main() {
  let memberId;
  try {
    await waitForServer();

    const adminResponse = await request('/api/auth/login', {
      method: 'POST',
      body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
    });
    assert(adminResponse.status === 200, 'Admin login failed.');
    const admin = (await adminResponse.json()).user;
    const adminCookieHeader = adminResponse.headers.get('set-cookie') || '';
    const adminCookie = adminCookieHeader.split(';')[0];
    assert(admin.role === 'admin', 'The configured login is not an admin.');
    const expiresAt = new Date(adminCookieHeader.match(/Expires=([^;]+)/)?.[1] || '');
    assert(Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() - Date.now() >= 6 * 24 * 60 * 60 * 1000, 'Login cookie is not persistent for seven days.');
    const adminSessionResponse = await request('/api/auth/me', { cookie: adminCookie });
    assert((await adminSessionResponse.json()).user?.email === admin.email, 'Admin session was not restored.');

    const registerResponse = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Temporary Auth Test', email: memberEmail, password: 'MemberSmokeTest26' },
    });
    assert(registerResponse.status === 201, 'Member signup failed.');
    const member = (await registerResponse.json()).user;
    memberId = member.id;
    const memberCookie = (registerResponse.headers.get('set-cookie') || '').split(';')[0];
    assert(member.role === 'member', 'Public signup did not create a member account.');
    const memberSessionResponse = await request('/api/auth/me', { cookie: memberCookie });
    assert((await memberSessionResponse.json()).user?.email === memberEmail, 'Member session was not restored.');

    console.log('Auth checks passed: admin email login, member signup, and persistent sessions for both accounts.');
  } finally {
    if (memberId) db.prepare('DELETE FROM users WHERE id = ?').run(memberId);
    db.close();
    server.kill();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
