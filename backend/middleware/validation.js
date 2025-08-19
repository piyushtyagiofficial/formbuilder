const Joi = require('joi');

const fieldSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid('text', 'email', 'select', 'checkbox', 'radio', 'textarea', 'file').required(),
  label: Joi.string().required().max(200),
  placeholder: Joi.string().allow('').max(200),
  required: Joi.boolean().default(false),
  options: Joi.array().items(Joi.string().max(100)),
  validation: Joi.object({
    minLength: Joi.number().min(0).max(10000),
    maxLength: Joi.number().min(0).max(10000),
    pattern: Joi.string().max(500)
  }).allow(null)
});

const formSchema = Joi.object({
  title: Joi.string().required().max(200).trim(),
  description: Joi.string().allow('').max(1000).trim(),
  fields: Joi.array().items(fieldSchema).required(),
  status: Joi.string().valid('draft', 'published').default('draft'),
  settings: Joi.object({
    thankYouMessage: Joi.string().max(1000),
    submissionLimit: Joi.number().min(1).max(10000).allow(null),
    allowFileUploads: Joi.boolean().default(false)
  }).default({})
});

const validateForm = (req, res, next) => {
  const { error } = formSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

const validateSubmission = (req, res, next) => {
  // Basic validation - specific validation would depend on form fields
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Submission data is required' });
  }
  
  // Additional validation could be added here based on form schema
  next();
};

module.exports = {
  validateForm,
  validateSubmission
};