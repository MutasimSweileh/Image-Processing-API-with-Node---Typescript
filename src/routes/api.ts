import express, { Request, Response, Router } from 'express';
import { processImage, input_path, output_path } from '../image-processing'; // Image handling
import Joi from 'joi';
import glob from 'glob';
import path from 'path';
import fs from 'fs';
const app: Router = express.Router();
app.get('/api/images', (req: Request, res: Response): void => {
  const bodyOrquery = req.query ?? req.body;
  const validate = Joi.object({
    filename: Joi.string().required(),
    width: Joi.number().min(5).required(),
    height: Joi.number().min(5).required()
  }).validate(bodyOrquery);
  if (validate.error) {
    res.status(400).json({ success: false, message: validate.error.details[0].message });
    return;
  }
  const values = validate.value;
  const imagePath = `${input_path}/${values.filename}.*`;
  /* A function that is used to find all the files that match the pattern. */
  glob(imagePath, (er: Error | null, files: string[]): void => {
    if (er != null) {
      res.status(400).json({ success: false, message: er.message });
      return;
    }
    if (files.length < 1) {
      res.status(404).json({ success: false, message: 'Input image not found!' });
      return;
    }
    files.forEach(v => {
      const newFile = path.parse(v);
      const output = `${output_path}/${newFile.name}-${values.width}x${
        values.height + newFile.ext
      }`;
      if (fs.existsSync(output)) {
        res.sendFile(output, { root: path.join(__dirname, '..', '..') });
        return;
      }
      processImage({
        src: v,
        target: output,
        width: parseInt(values.width),
        height: parseInt(values.height)
      }).then(result => {
        if (result.success) {
          res.sendFile(output, {
            root: path.join(__dirname, '..', '..')
          });
          return;
        } else {
          res.status(400).json({ success: false, message: result.message });
          return;
        }
      });
    });
  });
});

export default app;
