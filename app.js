const express = require("express");
const fileupload = require("express-fileupload");
const querystring = require('querystring');
const Joi = require("joi");
const sharp = require('sharp');
const glob = require("glob")
const path = require('path');
const helmet = require("helmet");
const morgan = require("morgan");
const debug = require('debug');
const d = debug("App");
debug.enable('*');
const app = express();
app.use(fileupload());
app.use(helmet());
app.use(morgan("dev"));
const port = process.env.PORT || 3000;
app.listen(port, () =>
    d(`App is listening on port ${port}.`)
);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
/* The path to the images. */
const input_path = "public/images";
/* The path to the output image. */
const output_path = "public/images/thumbnails";
/* A route handler api. */
app.get("/api/images", (req, res) => {
    const postOrget = (req.query ?? req.body);
    console.log(postOrget);
    const validate = Joi.object({
        filename: Joi.string().required(),
        width: Joi.number().required(),
        height: Joi.number().required()
    }).validate(postOrget);
    if (validate.error) {
        res.status(400).json({ success: false, message: validate.error.details[0].message });
    }
    const values = validate.value;
    const imagePath = `${input_path}/${values.filename}.*`;
    /* A function that is used to find all the files that match the pattern. */
    glob(imagePath, function (er, files) {
        if (er != null) { res.status(400).json({ success: false, message: err }).end(); }
        if (files.length < 1) {
            res.status(404).json({ success: false, message: "Input image not found!" }).end();
        }
        files.forEach(v => {
            const newFile = path.parse(v);
            const output = `${output_path}/${newFile.name}-${values.width}x${values.height + newFile.ext}`;
            sharp(v)
                .resize(values.width, values.height)
                .toFile(output)
                .then(data => { res.sendFile(output, { root: __dirname }) })
                .catch(err => { res.status(400).json({ success: false, message: err }).end(); });
        });
    });
})

/* A route handler. */
app.get("/:slug?", (req, res) => {
    const slug = req.params.slug;
    const imagePath = `${input_path}/*.*`;
    switch (slug) {
        case undefined:
        case "index":
        case "images":
            glob(imagePath, function (er, files) {
                let images = [];
                files.forEach(v => {
                    const file = path.parse(v);
                    images.push({ name: file.name, file: file.base });
                });
                res.render("index", { title: "Home", images });
            });
            break;
        case "about":
            res.render("about", { title: "About" });
            break;
        case "resize":
            res.render("resize", { title: "Resize", file: null });
            break;
        default:
            res.status(404).render("404", { title: "404 Not Found" });
            break;
    }
})
app.get("/resize/:file", (req, res) => {
    const file = req.params.file;
    const imagePath = `${input_path}/${file}.*`;
    glob(imagePath, function (er, files) {
        if (er != null) { res.status(400).json({ success: false, message: err }).end(); }
        if (files.length < 1) {
            res.status(404).json({ success: false, message: "Input image not found!" }).end();
        }
        res.render("resize", { title: "Resize", file: { basename: path.basename(files[0]), name: path.parse(files[0]).name } });
    });
});
app.post("/images", (req, res) => {
    const validate = Joi.object({
        filename: Joi.string(),
        width: Joi.number().required(),
        height: Joi.number().required()
    }).validate(req.body);
    if (validate.error) {
        res.status(400).json({ success: false, message: validate.error.details[0].message }).end();
    } else if ((!req.files || Object.keys(req.files).length === 0) && !req.body.filename) {
        res.status(400).send({ status: false, message: 'No file uploaded' }).end();
    }
    new Promise((resolve, reject) => {
        if (req.body.filename) {
            resolve(req.body.filename);
        } else {
            let file = req.files.file;
            file.mv(`${input_path}/${file.name}`, function (err) {
                if (err)
                    reject(err);
                resolve(path.parse(file.name).name);
            });
        }
    }).then(result => {
        const query = querystring.stringify({
            filename: result,
            width: req.body.width,
            height: req.body.height
        });
        res.redirect('/api/images?' + query);
    }).catch(err => {
        d(err);
        res.status(500).send({ status: false, message: err });
    });
})




//Redirecting
app.use((req, res, next) => {
    res.redirect("/404")
})