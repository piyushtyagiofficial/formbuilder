const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const { validateForm, validateSubmission } = require('../middleware/validation');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // max 10 files
  }
});

// GET /api/forms - Get all forms
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const forms = await Form.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Form.countDocuments(query);

    res.json({
      forms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forms/dashboard/analytics - Get dashboard analytics
router.get('/dashboard/analytics', async (req, res) => {
  try {
    // Get submissions from last 7 days grouped by day
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const submissionsThisWeek = await Submission.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          submissions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create a map for easy lookup
    const submissionMap = {};
    submissionsThisWeek.forEach(item => {
      submissionMap[item._id] = item.submissions;
    });

    // Generate chart data for the last 7 days
    const chartData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const dayName = days[date.getDay()];
      
      chartData.push({
        name: dayName,
        submissions: submissionMap[dateString] || 0,
        date: dateString
      });
    }

    // Calculate total submissions this week
    const totalThisWeek = chartData.reduce((sum, day) => sum + day.submissions, 0);

    // Get previous week for comparison
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekSubmissions = await Submission.countDocuments({
      createdAt: { 
        $gte: twoWeeksAgo,
        $lt: weekAgo
      }
    });

    // Calculate growth percentage
    let growthPercentage = 0;
    if (previousWeekSubmissions > 0) {
      growthPercentage = Math.round(((totalThisWeek - previousWeekSubmissions) / previousWeekSubmissions) * 100);
    } else if (totalThisWeek > 0) {
      growthPercentage = 100; // 100% growth if previous week had 0 submissions
    }

    res.json({
      chartData,
      totalThisWeek,
      previousWeek: previousWeekSubmissions,
      growthPercentage: growthPercentage >= 0 ? `+${growthPercentage}%` : `${growthPercentage}%`
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forms/:id - Get single form
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forms - Create new form
router.post('/', validateForm, async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/forms/:id - Update form
router.put('/:id', validateForm, async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Form not found' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/forms/:id - Delete form
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Delete associated submissions
    await Submission.deleteMany({ formId: req.params.id });
    
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forms/:id/duplicate - Duplicate form
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalForm = await Form.findById(req.params.id);
    if (!originalForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const duplicatedForm = new Form({
      title: `${originalForm.title} (Copy)`,
      description: originalForm.description,
      fields: originalForm.fields,
      status: 'draft',
      settings: originalForm.settings
    });

    await duplicatedForm.save();
    res.status(201).json(duplicatedForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forms/:id/submissions - Get form submissions
router.get('/:id/submissions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ formId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments({ formId: req.params.id });

    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forms/:id/submissions - Submit form
router.post('/:id/submissions', upload.any(), validateSubmission, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (form.status !== 'published') {
      return res.status(400).json({ error: 'Form is not published' });
    }

    // Check submission limit
    if (form.settings.submissionLimit && 
        form.submissionCount >= form.settings.submissionLimit) {
      return res.status(400).json({ error: 'Submission limit reached' });
    }

    // Process file uploads
    const files = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file);
          files.push({
            fieldId: file.fieldname,
            filename: file.originalname,
            url: uploadResult.secure_url,
            size: file.size,
            mimetype: file.mimetype
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
        }
      }
    }

    // Create submission
    const submission = new Submission({
      formId: req.params.id,
      data: req.body,
      files,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await submission.save();

    // Increment submission count
    await Form.findByIdAndUpdate(req.params.id, {
      $inc: { submissionCount: 1 }
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// GET /api/forms/:id/analytics - Get form analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get basic stats
    const totalSubmissions = await Submission.countDocuments({ 
      formId: req.params.id 
    });

    // Get submissions from last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = await Submission.countDocuments({
      formId: req.params.id,
      createdAt: { $gte: weekAgo }
    });

    // Get submissions over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const submissionsOverTime = await Submission.aggregate([
      {
        $match: {
          formId: new mongoose.Types.ObjectId(req.params.id),
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          submissions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent submissions with user agent data
    const recentSubmissions = await Submission.find({ formId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate device types from user agent strings
    const allSubmissions = await Submission.find({ formId: req.params.id });
    const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 };
    
    allSubmissions.forEach(submission => {
      const userAgent = submission.userAgent || '';
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      const isTablet = /iPad|Tablet/.test(userAgent);
      
      if (isTablet) {
        deviceCounts.Tablet++;
      } else if (isMobile) {
        deviceCounts.Mobile++;
      } else if (userAgent && userAgent.trim() !== '') {
        deviceCounts.Desktop++;
      } else {
        deviceCounts.Unknown++;
      }
    });

    // Convert to chart format
    const deviceTypes = Object.entries(deviceCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));

    res.json({
      totalSubmissions,
      thisWeek,
      completionRate: totalSubmissions > 0 ? Math.round((thisWeek / totalSubmissions) * 100) + '%' : '0%',
      avgTime: '1m', // Mock data - would need timing data collection
      submissionsOverTime: submissionsOverTime.map(item => ({
        date: item._id,
        submissions: item.submissions
      })),
      deviceTypes,
      recentSubmissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forms/:id/export - Export submissions as CSV
router.get('/:id/export', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const submissions = await Submission.find({ formId: req.params.id })
      .sort({ createdAt: -1 });

    // Generate CSV
    let csv = '';
    
    // Headers
    const headers = ['Submitted At'];
    form.fields.forEach(field => {
      headers.push(field.label);
      // Add a separate column for file fields
      if (field.type === 'file') {
        headers.push(`${field.label} - File URLs`);
      }
    });
    // Add general files column for any additional files
    headers.push('All Uploaded Files');
    csv += headers.join(',') + '\n';

    // Data rows
    submissions.forEach(submission => {
      const row = [new Date(submission.createdAt).toISOString()];
      
      form.fields.forEach(field => {
        const value = submission.data[field.id] || '';
        // Escape commas and quotes
        const escaped = String(value).replace(/"/g, '""');
        row.push(`"${escaped}"`);
        
        // Add file URLs for file fields
        if (field.type === 'file') {
          const fieldFiles = (submission.files || []).filter(file => file.fieldId === field.id);
          const fileUrls = fieldFiles.map(file => {
            const filename = file.filename || 'Unknown file';
            const size = file.size ? `${(file.size / 1024).toFixed(1)}KB` : 'Unknown size';
            return `${filename} (${size}): ${file.url}`;
          }).join(' | ');
          const escapedUrls = fileUrls.replace(/"/g, '""');
          row.push(`"${escapedUrls}"`);
        }
      });
      
      // Add all uploaded files column
      const allFiles = (submission.files || []).map(file => file.url).join(' | ');
      const escapedAllFiles = allFiles.replace(/"/g, '""');
      row.push(`"${escapedAllFiles}"`);
      
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form-${form.title}-submissions.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;