const Joi = require('joi');

const currentYear = new Date().getFullYear();
const SongPayloadSchema = Joi.object({
  title: Joi.string().max(255).required(),
  year: Joi
    .number()
    .integer()
    .min(1900)
    .max(currentYear)
    .required(),
  genre: Joi.string().max(255).required(),
  performer: Joi.string().max(255).required(),
  duration: Joi.number().min(1).optional(),
  albumId: Joi.string().max(50).optional(),
});

module.exports = { SongPayloadSchema };
