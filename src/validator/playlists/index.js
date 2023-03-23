const InvariantError = require('../../exceptions/InvariantError')
const { PlaylistPayloadSchema } = require('./schema')

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = SongsValidator
