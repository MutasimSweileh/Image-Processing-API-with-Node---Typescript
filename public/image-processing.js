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
exports.output_path = exports.input_path = exports.processImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const input_path = './public/assets/images';
exports.input_path = input_path;
/* The path to the output image. */
const output_path = './public/assets/images/thumbnails';
exports.output_path = output_path;
/**
 * Process image via sharp.
 * @param {sharpResizeParams} params Parameters.
 * @param {string} params.src Source image path.
 * @param {string} params.target Target path.
 * @param {number} params.width Target width.
 * @param {number} params.height Target height.
 * @return {OutputInfo|string} Error message or null.
 */
const processImage = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const output = yield (0, sharp_1.default)(params.src)
            .resize(params.width, params.height)
            .toFile(params.target);
        return {
            success: true,
            output
        };
    }
    catch (error) {
        let message = 'Image could not be processed.';
        if (error instanceof Error && error.message)
            message = error.message;
        return {
            success: false,
            message
        };
    }
});
exports.processImage = processImage;
