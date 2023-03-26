const InvariantError = require('../../exceptions/InvariantError')
const { ImageCoverHeadersSchema } = require('./schema')

const UploadsValidator = {
  validateImageCoverHeaders: (headers) => {
    const validationResult = ImageCoverHeadersSchema.validate(headers)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = UploadsValidator
