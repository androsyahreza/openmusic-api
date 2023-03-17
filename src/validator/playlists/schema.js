const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
  // songId: Joi.string().regex(/^song-.+$/).required(),
});

module.exports = { PlaylistPayloadSchema, PlaylistSongPayloadSchema };
