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
const request = (0, supertest_1.default)(app_1.default);
describe('Test endpoint response', () => {
    it('gets the endpoint homepage', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/images/');
        expect(response.status).toBe(200);
    }));
    it('gets the endpoint resize page and expect 200 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/resize/icelandwaterfall');
        expect(response.status).toBe(200);
    }));
    it('gets the endpoint resize page and expect error', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/resize/icelandwaterfall2');
        expect(response.status).toBe(404);
        expect(response.body.message).toContain('Input image not found');
    }));
});
describe('Image resize api function should resolve or reject', () => {
    it('Expect specific Error from the endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images/');
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('required');
    }));
    it('Expect success response from the endpoint with output image', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images/?filename=icelandwaterfall&width=200&height=200');
        //console.log(response);
        expect(response.status).toBe(200);
        expect(response.type).toContain('image');
    }));
});
