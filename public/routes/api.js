"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const sharp_1 = __importDefault(require("sharp"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = express_1.default.Router();
const input_path = "./public/assets/images";
/* The path to the output image. */
const output_path = "./public/assets/images/thumbnails";
app.get("/api/images", (req, res) => {
    var _a;
    const bodyOrquery = ((_a = req.query) !== null && _a !== void 0 ? _a : req.body);
    //console.log(postOrget);
    const validate = joi_1.default.object({
        filename: joi_1.default.string().required(),
        width: joi_1.default.number().min(5).required(),
        height: joi_1.default.number().min(5).required()
    }).validate(bodyOrquery);
    if (validate.error) {
        return res.status(400).json({ success: false, message: validate.error.details[0].message });
    }
    const values = validate.value;
    const imagePath = `${input_path}/${values.filename}.*`;
    /* A function that is used to find all the files that match the pattern. */
    (0, glob_1.default)(imagePath, (er, files) => {
        if (er != null) {
            res.status(400).json({ success: false, message: er.message });
        }
        if (files.length < 1) {
            return res.status(404).json({ success: false, message: "Input image not found!" });
        }
        files.forEach(v => {
            const newFile = path_1.default.parse(v);
            const output = `${output_path}/${newFile.name}-${values.width}x${values.height + newFile.ext}`;
            if (fs_1.default.existsSync(output)) {
                return res.sendFile(output, { root: path_1.default.join(__dirname, "..", "..") });
            }
            (0, sharp_1.default)(v)
                .resize(values.width, values.height)
                .toFile(output)
                .then((data) => { return res.sendFile(output, { root: path_1.default.join(__dirname, "..", "..") }); })
                .catch((err) => { return res.status(400).json({ success: false, message: err.message }); });
        });
    });
});
exports.default = app;
