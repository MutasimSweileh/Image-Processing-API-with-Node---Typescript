"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const image_processing_1 = require("../image-processing"); // Image handling
const request = (0, supertest_1.default)(app_1.default);
describe('Test endpoint response', () => {
    it('gets /', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/');
        expect(response.status).toBe(200);
    }));
    it('gets the endpoint images', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/images/');
        expect(response.status).toBe(200);
    }));
    it('gets the endpoint resize page and expect 200 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/resize/icelandwaterfall');
        expect(response.status).toBe(200);
    }));
    it('gets the endpoint resize page and expect 404 page', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/resize/icelandwaterfall2');
        expect(response.status).toBe(404);
        expect(response.body.message).toContain('Input image not found');
    }));
});
describe('Image resize api endpoint tests', () => {
    it('gets /api/images (no arguments)', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images/');
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('required');
    }));
    it('gets /api/images?filename=fjord&width=-200&height=200 (invalid args)', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images?filename=fjord&width=-200&height=200');
        expect(response.status).toBe(400);
    }));
    it('gets /api/images?filename=fjord&width=200&height=200 (valid args)', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images/?filename=fjord&width=200&height=200');
        expect(response.status).toBe(200);
        expect(response.type).toContain('image');
    }));
});
describe('Image resize api function tests', () => {
    it('image processing function (invalid args)', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, image_processing_1.processImage)({
            src: '',
            target: '',
            width: 200,
            height: 200
        });
        expect(result.success).toBeFalsy();
    }));
    it('image processing function (valid args)', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, image_processing_1.processImage)({
            src: `${image_processing_1.input_path}/fjord.jpg`,
            target: `${image_processing_1.output_path}/fjord100x100.jpg`,
            width: 100,
            height: 100
        });
        expect(result.success).toBeTruthy();
    }));
});
describe('endpoint: /foo', () => {
    it('returns 404 for invalid endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/foo');
        expect(response.status).toBe(404);
    }));
});
