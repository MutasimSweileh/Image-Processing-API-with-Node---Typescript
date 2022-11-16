import express, { Application, Request, Response } from "express";
import Joi from "joi";
import sharp from "sharp";
import glob from "glob";
import path from "path";
import fs from "fs";
const app = express.Router();
const input_path = "./public/assets/images";
/* The path to the output image. */
const output_path = "./public/assets/images/thumbnails";

app.get("/api/images", (req: Request, res: Response) => {
    const bodyOrquery = (req.query ?? req.body);
    //console.log(postOrget);
    const validate = Joi.object({
        filename: Joi.string().required(),
        width: Joi.number().required(),
        height: Joi.number().required()
    }).validate(bodyOrquery);
    if (validate.error) {
        return res.status(400).json({ success: false, message: validate.error.details[0].message });
    }
    const values = validate.value;
    const imagePath = `${input_path}/${values.filename}.*`;
    /* A function that is used to find all the files that match the pattern. */
    glob(imagePath, (er: Error | null, files: string[]) => {
        if (er != null) { res.status(400).json({ success: false, message: er.message }); }
        if (files.length < 1) {
            return res.status(404).json({ success: false, message: "Input image not found!" });
        }
        files.forEach(v => {
            const newFile = path.parse(v);
            const output = `${output_path}/${newFile.name}-${values.width}x${values.height + newFile.ext}`;
            if (fs.existsSync(output)) {
                return res.sendFile(output, { root: path.join(__dirname, "..", "..") });
            }
            sharp(v)
                .resize(values.width, values.height)
                .toFile(output)
                .then((data) => { return res.sendFile(output, { root: path.join(__dirname, "..", "..") }) })
                .catch((err: Error) => { return res.status(400).json({ success: false, message: err.message }); });
        });
    });
});

export default app;