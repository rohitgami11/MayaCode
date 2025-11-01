# Public GET Endpoints for Postman Testing

Base URL: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net`

## 1. Health Check
**GET** `/`
- **Description**: Check if the backend is running
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/`
- **Expected Response**: JSON with server status and available endpoints

## 2. Get All Posts
**GET** `/api/posts`
- **Description**: Retrieve all posts
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/posts`
- **Query Parameters** (optional):
  - `limit`: Number of posts to return
  - `skip`: Number of posts to skip
  - `type`: Filter by post type (help, offer, story)

## 3. Get Post by ID
**GET** `/api/posts/:id`
- **Description**: Get a specific post by its ID
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/posts/POST_ID_HERE`
- **Note**: Replace `POST_ID_HERE` with an actual post ID from the database

## 4. Get Post Images
**GET** `/api/posts/:id/images`
- **Description**: Get images for a specific post
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/posts/POST_ID_HERE/images`

## 5. Get User Posts by Phone
**GET** `/api/posts/phone/:phone`
- **Description**: Get all posts created by a user (using phone number)
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/posts/phone/+1234567890`
- **Note**: Replace with actual phone number

## 6. Get User by Email
**GET** `/api/users/email/:email`
- **Description**: Get user profile by email address
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/users/email/test@example.com`

## 7. Get All Users
**GET** `/api/users/`
- **Description**: Get list of all users
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/users/`
- **Note**: This might return a large list, use with caution

## 8. Get User Preferences
**GET** `/api/users/email/:email/preferences`
- **Description**: Get user preferences by email
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/users/email/test@example.com/preferences`

## 9. List Images by Category
**GET** `/api/images/:category`
- **Description**: Get list of images in a category
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/images/stories`
- **Categories**: stories, help-posts, etc.

## 10. Get Specific Image
**GET** `/api/images/:category/:number`
- **Description**: Get a specific image by category and number
- **Example**: `http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/images/stories/1`

## Quick Test Steps for Postman:

1. **Start with Health Check** (most likely to work):
   ```
   GET http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/
   ```

2. **Then test Posts endpoint**:
   ```
   GET http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/posts
   ```

3. **If you get data, test with query parameters**:
   ```
   GET http://maya-b6d7g0ephnhhe4ay.canadacentral-01.azurewebsites.net/api/posts?limit=5&type=help
   ```

## Important Notes:

⚠️ **If you get 500 errors**, the backend might need:
- MongoDB connection string (`MONGODB_URI`) configured in Azure App Service settings
- Other environment variables set up

⚠️ **If you get empty arrays `[]`**, the database might be empty, which is normal for a fresh deployment.

⚠️ **For endpoints with `:id` or `:email`**, you'll need actual IDs/emails from your database to test them.

