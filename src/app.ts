import express, { Application, Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import api from './routes/api'
import querystring from 'querystring'
import Joi from 'joi'
import glob from 'glob'
import path from 'path'
import helmet from 'helmet'
import morgan from 'morgan'
import debug from 'debug'
const d = debug('App')
debug.enable('*')
const app: Application = express()
app.use(fileUpload())
app.use(helmet())
app.use(morgan('dev'))
const port = process.env.PORT || 3000
app.listen(port, () => d(`App is listening on port ${port}.`))
app.use(express.static(path.join(__dirname, 'assets')))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
/* The path to the images. */
const input_path = './public/assets/images'

/* A route handler api. */
app.use(api)

/* The Main route handler. */
app.get('/:slug?', (req: Request, res: Response) => {
  const slug = req.params.slug
  const imagePath = `${input_path}/*.*`
  switch (slug) {
    case undefined:
    case 'index':
    case 'images':
      glob(imagePath, (er: Error | null, files: string[]) => {
        const images: object[] = []
        files.forEach((v: string) => {
          const file = path.parse(v)
          images.push({ name: file.name, file: file.base })
        })
        return res.render('index', { title: 'Home', images })
      })
      break
    case 'about':
      res.render('about', { title: 'About' })
      break
    case 'resize':
      res.render('resize', { title: 'Resize', file: null })
      break
    default:
      res.status(404).render('404', { title: '404 Not Found' })
      break
  }
})
app.get('/resize/:file', (req: Request, res: Response) => {
  const file = req.params.file
  const imagePath = `${input_path}/${file}.*`
  glob(imagePath, (er: Error | null, files: string[]) => {
    if (er != null) {
      res.status(400).json({ success: false, message: er.message })
    }
    if (files.length < 1) {
      return res
        .status(404)
        .json({ success: false, message: 'Input image not found!' })
    } else
      return res.render('resize', {
        title: 'Resize',
        file: {
          basename: path.basename(files[0]),
          name: path.parse(files[0]).name,
        },
      })
  })
})

/* A route handler for upload/edit image form route. */
app.post('/images', (req: Request, res: Response) => {
  const validate = Joi.object({
    filename: Joi.string(),
    width: Joi.number().required(),
    height: Joi.number().required(),
  }).validate(req.body)
  if (validate.error) {
    return res
      .status(400)
      .json({ success: false, message: validate.error.details[0].message })
  } else if (
    (!req.files || Object.keys(req.files).length === 0) &&
    !req.body.filename
  ) {
    return res.status(400).send({ status: false, message: 'No file uploaded' })
  }
  new Promise<string>((resolve, reject) => {
    if (req.body.filename) {
      resolve(req.body.filename)
    } else if (req.files !== null) {
      const file = req.files?.file as fileUpload.UploadedFile
      file.mv(`${input_path}/${file.name}`, (err) => {
        if (err) reject(err)
        resolve(path.parse(file.name).name)
      })
    }
  })
    .then((result) => {
      const query = querystring.stringify({
        filename: result,
        width: req.body.width,
        height: req.body.height,
      })
      return res.redirect('/api/images?' + query)
    })
    .catch((err) => {
      d(err)
      return res.status(500).send({ status: false, message: err.message })
    })
})

//Redirecting
app.use((_: Request, res: Response) => {
  res.redirect('/404')
})

export default app
