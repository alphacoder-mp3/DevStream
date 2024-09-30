# DevStream

**DevStream** is a full-featured video streaming platform inspired by YouTube. Users can upload, view, like, and comment on videos, subscribe to channels, and keep track of their favorite content creators.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [API Endpoints](#api-endpoints)
5. [Usage](#usage)
6. [Project Structure](#project-structure)
7. [Contributing](#contributing)
8. [License](#license)

## Features

- **User Authentication:** Secure sign-up and login functionality.
- **Video Upload & Management:** Users can upload videos, with thumbnail support, descriptions, and optional metadata.
- **Subscriptions:** Subscribe to channels to follow creators.
- **Likes & Comments:** Like videos and leave comments on them.
- **Paginated Content:** Videos, comments, and subscriptions are efficiently paginated.
- **Dashboard:** View detailed statistics for a channel including total views, total subscribers, and more.
- **Real-time Interactions:** Real-time like and comment toggles, using efficient API calls.

## Tech Stack

- **Backend:**

  - Node.js
  - Express.js
  - MongoDB with Mongoose (ORM)
  - Multer
  - TypeScript for static typing
  - Cloudinary for media storage
  - JWT for authentication

- **Frontend:**

  - React
  - Tailwind CSS for UI
  - Next.js (with App Router for SSR)
  - ShadCN UI for component styling
  - TypeScript for static typing

- **Other Tools:**
  - Jest & React Testing Library (for testing)
  - Docker (for containerization)
  - GitHub Actions (for CI/CD)

## Getting Started

### Prerequisites

- Node.js v22+
- MongoDB (locally or a cloud service like MongoDB Atlas)
- AWS account for S3 video storage
- IPStack API key (for IP data retrieval)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/devstream.git
   cd devstream
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**

   Create a `.env` file in the root directory and configure the following:

   ```bash
   NODE_ENV=development
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   S3_BUCKET_NAME=your_aws_s3_bucket_name
   S3_ACCESS_KEY=your_aws_access_key
   S3_SECRET_KEY=your_aws_secret_key
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run the app:**

   ```bash
   npm run dev
   ```

5. **Server will start at:**
   ```
   http://localhost:5000
   ```

## API Endpoints

Here are the key API endpoints for **DevStream**:

- **Auth Routes:**

  - `POST

  /api/auth/register` - Register a new user

  - `POST /api/auth/login` - Login a user

- **Video Routes:**

  - `POST /api/videos/upload` - Upload a new video
  - `GET /api/videos/:videoId` - Get details of a specific video
  - `DELETE /api/videos/:videoId` - Delete a video

- **Comment Routes:**

  - `POST /api/comments/:videoId` - Add a comment to a video
  - `GET /api/comments/:videoId` - Get all comments for a video
  - `PUT /api/comments/:commentId` - Update a comment
  - `DELETE /api/comments/:commentId` - Delete a comment

- **Like Routes:**

  - `POST /api/likes/:videoId` - Like a video
  - `DELETE /api/likes/:videoId` - Unlike a video

- **Subscription Routes:**

  - `POST /api/subscriptions/:channelId` - Subscribe to a channel
  - `DELETE /api/subscriptions/:channelId` - Unsubscribe from a channel

- **Dashboard Routes:**
  - `GET /api/dashboard/stats/:channelId` - Get channel statistics
  - `GET /api/dashboard/videos/:channelId` - Get all videos uploaded by a channel

## Usage

### Uploading Videos

1. Navigate to the **Upload** section of the platform.
2. Select a video file, provide a title, description, and thumbnail, and click **Upload**.
3. The video will be stored in an S3 bucket and accessible through the platform.

### Interacting with Videos

- **Like** a video to show your appreciation.
- **Comment** on videos to share your thoughts or feedback.
- **Subscribe** to a channel to stay updated with new content.

### Viewing Channel Dashboard

- View total video views, total subscribers, and other statistics through the dashboard for channel owners.

## Project Structure

```
devstream/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── styles/
├── tests/
│   ├── unit/
│   ├── integration/
└── README.md
```

## Contributing

We welcome contributions! Here's how you can get started:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
