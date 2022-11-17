import supertest from 'supertest';
import app from '../app';

const request = supertest(app);

describe('Test endpoint response', () => {
  it('gets the endpoint homepage', async () => {
    const response = await request.get('/images/');
    expect(response.status).toBe(200);
  });
  it('gets the endpoint resize page and expect 200 status code', async () => {
    const response = await request.get('/resize/icelandwaterfall');
    expect(response.status).toBe(200);
  });
  it('gets the endpoint resize page and expect error', async () => {
    const response = await request.get('/resize/icelandwaterfall2');
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Input image not found');
  });
});
describe('Image resize api function should resolve or reject', () => {
  it('Expect specific Error from the endpoint', async () => {
    const response = await request.get('/api/images/');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('required');
  });
  it('Expect success response from the endpoint with output image', async () => {
    const response = await request.get(
      '/api/images/?filename=icelandwaterfall&width=200&height=200'
    );
    //console.log(response);
    expect(response.status).toBe(200);
    expect(response.type).toContain('image');
  });
});
