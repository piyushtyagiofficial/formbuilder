const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  files: [{
    fieldId: String,
    filename: String,
    url: String,
    size: Number,
    mimetype: String
  }],
  ipAddress: { 
    type: String,
    maxlength: 45 // IPv6 max length
  },
  userAgent: { 
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for performance
submissionSchema.index({ formId: 1, createdAt: -1 });
submissionSchema.index({ createdAt: -1 });

// Transform output
submissionSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    ret.submittedAt = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Submission', submissionSchema);