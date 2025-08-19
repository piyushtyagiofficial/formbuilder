const mongoose = require('mongoose');

const validationSchema = new mongoose.Schema({
  minLength: { type: Number },
  maxLength: { type: Number },
  pattern: { type: String }
}, { _id: false });

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'email', 'select', 'checkbox', 'radio', 'textarea', 'file']
  },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  validation: validationSchema
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  thankYouMessage: { type: String, default: 'Thank you for your submission!' },
  submissionLimit: { type: Number },
  allowFileUploads: { type: Boolean, default: false }
}, { _id: false });

const formSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  fields: [fieldSchema],
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  submissionCount: { 
    type: Number, 
    default: 0 
  },
  settings: {
    type: settingsSchema,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better performance
formSchema.index({ status: 1, createdAt: -1 });
formSchema.index({ title: 'text', description: 'text' });

// Virtual for form URL
formSchema.virtual('url').get(function() {
  return `/f/${this._id}`;
});

// Transform output
formSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Form', formSchema);