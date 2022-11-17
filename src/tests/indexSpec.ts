import supertest from 'supertest';
import app from '../app';
import { processImage, input_path, output_path } from '../image-processing'; // Image handling
const request = supertest(app);

describe('Test endpoint response', () => {
  it('gets /', async (): Promise<void> => {
    const response: supertest.Response = await request.get('/');
    expect(response.status).toBe(200);
  });
  it('gets the endpoint images', async () => {
    const response = await request.get('/images/');
    expect(response.status).toBe(200);
  });
  it('gets the endpoint resize page and expect 200 status code', async () => {
    const response = await request.get('/resize/icelandwaterfall');
    expect(response.status).toBe(200);
  });
  it('gets the endpoint resize page and expect 404 page', async () => {
    const response = await request.get('/resize/icelandwaterfall2');
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Input image not found');
  });
});

describe('Image resize api endpoint tests', () => {
  it('gets /api/images (no arguments)', async () => {
    const response = await request.get('/api/images/');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('required');
  });
  it('gets /api/images?filename=fjord&width=-200&height=200 (invalid args)', async (): Promise<void> => {
    const response: supertest.Response = await request.get(
      '/api/images?filename=fjord&width=-200&height=200'
    );
    expect(response.status).toBe(400);
  });
  it('gets /api/images?filename=fjord&width=200&height=200 (valid args)', async () => {
    const response = await request.get(
      '/api/images/?filename=fjord&width=200&height=200'
    );
    expect(response.status).toBe(200);
    expect(response.type).toContain('image');
  });
});
describe('Image resize function tests', (): void => {
  it('image processing function (invalid args)', async (): Promise<void> => {
    const result = await processImage({
      src: '',
      target: '',
      width: 200,
      height: 200
    });
    expect(result.success).toBeFalsy();
  });
  it('image processing function (valid args)', async (): Promise<void> => {
    const result = await processImage({
      src: `${input_path}/fjord.jpg`,
      target: `${output_path}/fjord100x100.jpg`,
      width: 100,
      height: 100
    });
    expect(result.success).toBeTruthy();
  });
});
describe('endpoint: /foo', (): void => {
  it('returns 404 for invalid endpoint', async (): Promise<void> => {
    const response: supertest.Response = await request.get('/foo');
    expect(response.status).toBe(404);
  });
});
