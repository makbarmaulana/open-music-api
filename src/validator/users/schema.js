const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().max(64).required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
