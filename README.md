# FormBuilder - Professional Form Builder Application

A complete full-stack form builder application featuring a drag-and-drop interface, analytics dashboard, and responsive design. Built with React, Node.js, Express, and MongoDB.

## Features

### Frontend Application
- **Drag-and-Drop Form Builder**: Intuitive interface for creating custom forms with real-time preview
- **Comprehensive Field Types**: Text input, email, select dropdown, checkbox, radio buttons, textarea, and file upload
- **Responsive Design**: Mobile-first approach using Tailwind CSS with enhanced color system
- **Real-Time Analytics Dashboard**: Interactive charts showing submission statistics and trends
- **Form Management**: Create, edit, duplicate, and manage forms with status tracking
- **CSV Export**: Download submission data in CSV format for analysis
- **Enhanced UI Components**: Modern interface using shadcn/ui component library with gradient designs
- **Standalone Form Views**: Forms can be accessed directly without navigation elements

### Backend API
- **RESTful API**: Complete CRUD operations for forms and submissions with comprehensive validation
- **File Upload System**: Cloudinary integration for secure image and document storage
- **Rate Limiting**: Built-in protection against spam and abuse with configurable limits
- **Data Analytics**: Real-time aggregation of submission statistics and analytics data
- **CSV Generation**: Server-side CSV file generation for data export functionality
- **Input Validation**: Comprehensive server-side validation using Joi and express-validator
- **Security Features**: CORS configuration, Helmet security headers, and compression middleware

### Security and Performance
- **Cross-Origin Resource Sharing**: Secure CORS configuration for frontend-backend communication
- **Input Sanitization**: Comprehensive data validation and sanitization on all endpoints
- **Rate Limiting**: Protection against abuse with configurable request limits per IP
- **File Security**: Secure file upload handling with size limits and type validation
- **Compression**: Gzip compression for improved performance and reduced bandwidth usage
- **Environment-Based Configuration**: Flexible configuration for different deployment environments

## Technology Stack

### Frontend Technologies
- **React**: Latest React version with improved performance and TypeScript support
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework with custom color system and gradients
- **Vite**: Fast build tool and development server with hot module replacement
- **shadcn/ui**: High-quality, accessible component library built on Radix UI primitives
- **React Hook Form**: Performant form state management with validation
- **React DnD**: Drag and drop functionality for form builder interface
- **Recharts**: Data visualization library for analytics charts and graphs
- **React Router DOM**: Client-side routing for single-page application navigation
- **Lucide React**: Beautiful and customizable icon library
- **Axios**: HTTP client for API communication with interceptors and error handling
- **Zod**: TypeScript-first schema validation for forms and API responses
- **Class Variance Authority**: Utility for building variant-based component APIs

### Backend Technologies
- **Node.js**: JavaScript runtime environment for server-side development
- **Express.js**: Fast and minimal web framework for Node.js applications
- **MongoDB**: NoSQL document database for flexible data storage
- **Mongoose**: Elegant MongoDB object modeling for Node.js with schema validation
- **Cloudinary**: Cloud-based image and video management service for file uploads
- **Multer**: Middleware for handling multipart/form-data file uploads
- **Express Rate Limit**: Middleware for rate limiting API requests
- **Joi**: Object schema description language and validator for JavaScript
- **Express Validator**: Middleware for server-side data validation
- **Helmet**: Security middleware for setting various HTTP headers
- **Morgan**: HTTP request logger middleware for Node.js
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing
- **Compression**: Middleware for compressing response bodies
- **Fast CSV**: Library for parsing and writing CSV files

## Installation and Setup

### Prerequisites
- Node.js version 18 or higher
- MongoDB database (local installation or MongoDB Atlas)
- Cloudinary account for file storage (free tier available)
- Git for version control

### Local Development Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd formbuilder
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Create `.env` file in the backend directory:
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/formbuilder
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

Create `.env` file in the frontend directory:
```bash
VITE_API_BASE_URL=http://localhost:5000
```

5. **Start Development Servers**

Terminal 1 - Backend Server:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend Development Server:
```bash
cd frontend
npm run dev
```

6. **Access the Application**
- Frontend Application: http://localhost:5173
- Backend API: http://localhost:5000


## API Documentation

### Form Management Endpoints

**GET /api/forms**
- Description: Retrieve all forms with pagination support
- Response: Array of form objects with metadata
- Query Parameters: page, limit, status, search

**POST /api/forms**
- Description: Create a new form
- Request Body: Form configuration object with fields and settings
- Response: Created form object with generated ID

**GET /api/forms/:id**
- Description: Retrieve a specific form by ID
- Parameters: id (MongoDB ObjectId)
- Response: Form object with all fields and configuration

**PUT /api/forms/:id**
- Description: Update an existing form
- Parameters: id (MongoDB ObjectId)
- Request Body: Updated form configuration
- Response: Updated form object

**DELETE /api/forms/:id**
- Description: Delete a form and all associated submissions
- Parameters: id (MongoDB ObjectId)
- Response: Deletion confirmation

**POST /api/forms/:id/duplicate**
- Description: Create a copy of an existing form
- Parameters: id (MongoDB ObjectId)
- Response: New form object with duplicated configuration

### Form Submission Endpoints

**POST /api/forms/:id/submissions**
- Description: Submit form data from end users
- Parameters: id (MongoDB ObjectId)
- Request Body: Form submission data matching form fields
- Response: Submission confirmation with ID

**GET /api/forms/:id/submissions**
- Description: Retrieve all submissions for a specific form
- Parameters: id (MongoDB ObjectId)
- Query Parameters: page, limit, startDate, endDate
- Response: Array of submission objects with timestamps

**GET /api/forms/:id/analytics**
- Description: Get analytics data for a form
- Parameters: id (MongoDB ObjectId)
- Response: Aggregated statistics including submission counts, trends, and field analytics

**GET /api/forms/:id/export**
- Description: Export form submissions as CSV file
- Parameters: id (MongoDB ObjectId)
- Query Parameters: format (csv), dateRange
- Response: CSV file download

### File Upload Endpoints

**POST /api/upload**
- Description: Upload files to Cloudinary storage
- Request: Multipart form data with file
- Response: File URL and metadata
- Supported Formats: Images (JPEG, PNG, GIF), Documents (PDF, DOC, DOCX)
- Size Limit: 10MB per file

## Configuration Options

### Environment Variables

**Backend Configuration (.env in backend directory)**
```bash
# Server Configuration
NODE_ENV=development|production
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/formbuilder

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

**Frontend Configuration (.env in frontend directory)**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

```

## Contributing

### Development Workflow
1. Fork the repository on GitHub
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following code style guidelines
4. Run tests to ensure functionality: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Create a Pull Request with detailed description


### Feature Requests
For new features, please provide:
- Detailed description of the proposed feature
- Use cases and user stories
- Mockups or wireframes if applicable
- Technical considerations and constraints

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For technical support and questions:
- Create an issue in the GitHub repository
- Check existing documentation and FAQ
- Review troubleshooting section above
- Contact development team for enterprise support


Built with modern web technologies and best practices for scalability, performance, and maintainability.
