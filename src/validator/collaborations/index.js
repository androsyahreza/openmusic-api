const InvariantError = require('../../exceptions/InvariantError');
const { PostCollaborationSchema, DeleteCollaborationSchema } = require('./schema');

const CollaborationValidator = {
  validatePostCollaborationPayload: (payload) => {
    const validationResult = PostCollaborationSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteCollaborationPayload: (payload) => {
    const validationResult = DeleteCollaborationSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationValidator;
