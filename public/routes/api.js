"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const image_processing_1 = require("../image-processing"); // Image handling
const joi_1 = __importDefault(require("joi"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = express_1.default.Router();
app.get('/api/images', (req, res) => {
    var _a;
    const bodyOrquery = (_a = req.query) !== null && _a !== void 0 ? _a : req.body;
    const validate = joi_1.default.object({
        filename: joi_1.default.string().required(),
        width: joi_1.default.number().min(5).required(),
        height: joi_1.default.number().min(5).required()
    }).validate(bodyOrquery);
    if (validate.error) {
        res.status(400).json({ success: false, message: validate.error.details[0].message });
        return;
    }
    const values = validate.value;
    const imagePath = `${image_processing_1.input_path}/${values.filename}.*`;
    /* A function that is used to find all the files that match the pattern. */
    (0, glob_1.default)(imagePath, (er, files) => {
        if (er != null) {
            res.status(400).json({ success: false, message: er.message });
            return;
        }
        if (files.length < 1) {
            res.status(404).json({ success: false, message: 'Input image not found!' });
            return;
        }
        files.forEach(v => {
            const newFile = path_1.default.parse(v);
            const output = `${image_processing_1.output_path}/${newFile.name}-${values.width}x${values.height + newFile.ext}`;
            if (fs_1.default.existsSync(output)) {
                res.sendFile(output, { root: path_1.default.join(__dirname, '..', '..') });
                return;
            }
            (0, image_processing_1.processImage)({
                src: v,
                target: output,
                width: parseInt(values.width),
                height: parseInt(values.height)
            }).then(result => {
                if (result.success) {
                    res.sendFile(output, {
                        root: path_1.default.join(__dirname, '..', '..')
                    });
                    return;
                }
                else {
                    res.status(400).json({ success: false, message: result.message });
                    return;
                }
            });
        });
    });
});
exports.default = app;
