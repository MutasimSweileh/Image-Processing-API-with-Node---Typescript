"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const api_1 = __importDefault(require("./routes/api"));
const querystring_1 = __importDefault(require("querystring"));
const joi_1 = __importDefault(require("joi"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const debug_1 = __importDefault(require("debug"));
const d = (0, debug_1.default)('App');
debug_1.default.enable('*');
const app = (0, express_1.default)();
app.use((0, express_fileupload_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
const port = process.env.PORT || 3000;
app.listen(port, () => d(`App is listening on port ${port}.`));
app.use(express_1.default.static(path_1.default.join(__dirname, 'assets')));
app.use(express_1.default.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
/* The path to the images. */
const input_path = './public/assets/images';
/* A route handler api. */
app.use(api_1.default);
/* The Main route handler. */
app.get('/:slug?', (req, res) => {
    const slug = req.params.slug;
    const imagePath = `${input_path}/*.*`;
    switch (slug) {
        case undefined:
        case 'index':
        case 'images':
            (0, glob_1.default)(imagePath, (er, files) => {
                const images = [];
                files.forEach((v) => {
                    const file = path_1.default.parse(v);
                    images.push({ name: file.name, file: file.base });
                });
                return res.render('index', { title: 'Home', images });
            });
            break;
        case 'about':
            res.render('about', { title: 'About' });
            break;
        case 'resize':
            res.render('resize', { title: 'Resize', file: null });
            break;
        default:
            res.status(404).render('404', { title: '404 Not Found' });
            break;
    }
});
app.get('/resize/:file', (req, res) => {
    const file = req.params.file;
    const imagePath = `${input_path}/${file}.*`;
    (0, glob_1.default)(imagePath, (er, files) => {
        if (er != null) {
            res.status(400).json({ success: false, message: er.message });
        }
        if (files.length < 1) {
            return res.status(404).json({ success: false, message: 'Input image not found!' });
        }
        else
            return res.render('resize', {
                title: 'Resize',
                file: {
                    basename: path_1.default.basename(files[0]),
                    name: path_1.default.parse(files[0]).name,
                },
            });
    });
});
/* A route handler for upload/edit image form route. */
app.post('/images', (req, res) => {
    const validate = joi_1.default.object({
        filename: joi_1.default.string(),
        width: joi_1.default.number().required(),
        height: joi_1.default.number().required(),
    }).validate(req.body);
    if (validate.error) {
        return res
            .status(400)
            .json({ success: false, message: validate.error.details[0].message });
    }
    else if ((!req.files || Object.keys(req.files).length === 0) && !req.body.filename) {
        return res.status(400).send({ status: false, message: 'No file uploaded' });
    }
    new Promise((resolve, reject) => {
        var _a;
        if (req.body.filename) {
            resolve(req.body.filename);
        }
        else if (req.files !== null) {
            const file = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
            file.mv(`${input_path}/${file.name}`, (err) => {
                if (err)
                    reject(err);
                resolve(path_1.default.parse(file.name).name);
            });
        }
    })
        .then((result) => {
        const query = querystring_1.default.stringify({
            filename: result,
            width: req.body.width,
            height: req.body.height,
        });
        return res.redirect('/api/images?' + query);
    })
        .catch((err) => {
        d(err);
        return res.status(500).send({ status: false, message: err.message });
    });
});
//Redirecting
app.use((_, res) => {
    res.redirect('/404');
});
exports.default = app;
