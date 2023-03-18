const Joi = require('joi');

const PostCollaborationSchema = Joi.object({
  playlistId: Joi.string().max(50).required(),
  userId: Joi.string().max(50).required(),
});

const DeleteCollaborationSchema = Joi.object({
  playlistId: Joi.string().max(50).required(),
  userId: Joi.string().max(50).required(),
});

module.exports = { PostCollaborationSchema, DeleteCollaborationSchema };
