const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().max(255).required(),
});

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().max(50).required(),
  // songId: Joi.string().regex(/^song-.+$/).required(),
});

module.exports = { PlaylistPayloadSchema, PlaylistSongPayloadSchema };
