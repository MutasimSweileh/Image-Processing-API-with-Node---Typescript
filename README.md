### Scripts

- build: `tsc`
- start: `npm run build && node public/app.js`
- test: `npm run build && jasmine`
- format: `prettier --write src/**/*.ts`
- lint: `eslint src/**/*.ts`
- lint:fix: `eslint --fix"`

### Usage

The server will listen on port 3000 If no `PORT` variable is found in the work environment:

#### Endpoint to resize images

http://localhost:3000/api/images

Expected query arguments are:

- _filename_: the name of the image without the extension.
- _width_: numerical pixel value > 5
- _height_: numerical pixel value > 5

#### Example 1

http://localhost:3000/images
The home page will display all uploaded images.

#### Example 2

http://localhost:3000/resize
The page for uploading a new image that contains input fields to enter the width and height and upload the image.

#### Example 3

http://localhost:3000/resize/fjord
Will display the original `fjord` image and input fields to enter the width and height.

#### Example 4

http://localhost:3000/api/images?filename=fjord&width=200&height=200
Will scale the fjord image to 200 by 200 pixels and store the resulting image.
On subsequent calls will serve the resized image instead of resizing the
original again.

#### Example 5

http://localhost:3000/api/images?filename=fjord&width=-200&height=200
Invalid width parameter that will be hinted to.

#### Example 6

http://localhost:3000/api/images?filename=fjord&width=200
Missing height parameter that will be hinted to.

### Notes

- Images are served from `assets/images`. Further images with the extension
  can be put into that directory, but the filetype is not checked.
- Image thumbs will be stored in `assets/images/thumbnails` and can be deleted from
  there to verify that in that case they will be re-created on subsequent calls
  to the same endpoint.
