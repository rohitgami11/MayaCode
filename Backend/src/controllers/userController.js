const UserProfile = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to extract user info from JWT token
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = jwt.verify(token, process.env.JWT_SECRET_VERIFY);
  return decoded;
};

// Get user profile by email
exports.getUserByEmail = async (req, res) => {
  console.log(`HTTP ${req.method} ${req.url} - Get User By Email`, req.params);
  try {
    const { email } = req.params;
    console.log('Get User - Request:', { email });

    const user = await UserProfile.findOne({ email });
    if (!user) {
      console.log('Get User - User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Get User - Success:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Get User - Error:', error);
    res.status(500).json({ message: 'Error getting user profile', error: error.message });
  }
};

// Create or update user profile
exports.createOrUpdateUser = async (req, res) => {
  try {
    console.log('Create/Update User - Starting process');
    const { email } = req.params;
    console.log('Create/Update User - Email:', email);
    
    // Get values from request body
    const updates = {
      name: req.body.name,
      userType: req.body.userType,
      age: req.body.age,
      languages: req.body.languages || [],
      profileImage: req.body.profileImage,
      location: req.body.location,
      lastActive: new Date()
    };
    
    console.log('Create/Update User - Request body:', req.body);
    console.log('Create/Update User - Updates:', updates);
    
    // Validate required fields
    if (!updates.name || !updates.userType) {
      console.log('Create/Update User - Missing required fields:', {
        hasName: !!updates.name,
        hasUserType: !!updates.userType,
        body: req.body
      });
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'userType']
      });
    }

    // Clean up updates
    console.log('Create/Update User - Cleaning updates');
    const cleanedUpdates = {
      email, // Add email to the updates
      name: updates.name,
      age: updates.age,
      userType: updates.userType,
      languages: updates.languages,
      profileImage: updates.profileImage,
      location: updates.location,
      lastActive: new Date()
    };

    // Remove undefined values
    Object.keys(cleanedUpdates).forEach(key => 
      cleanedUpdates[key] === undefined && delete cleanedUpdates[key]
    );
    console.log('Create/Update User - Final updates:', cleanedUpdates);

    console.log('Create/Update User - Attempting database operation');
    const user = await UserProfile.findOneAndUpdate(
      { email },
      { $set: cleanedUpdates },
      { 
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Create/Update User - Success:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Create/Update User - Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Error creating/updating user profile', 
      error: error.message 
    });
  }
};

// Delete user profile
exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Delete User - Request:', { email });

    const user = await UserProfile.findOneAndDelete({ email });
    if (!user) {
      console.log('Delete User - User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Delete User - Success:', user);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete User - Error:', error);
    res.status(500).json({ message: 'Error deleting user profile', error: error.message });
  }
};

// Update user stats
exports.updateUserStats = async (req, res) => {
  try {
    const { email } = req.params;
    const { stats } = req.body;
    console.log('Update Stats - Request:', { email, stats });

    const user = await UserProfile.findOneAndUpdate(
      { email },
      { $set: { stats } },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('Update Stats - User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Update Stats - Success:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Update Stats - Error:', error);
    res.status(500).json({ message: 'Error updating user stats', error: error.message });
  }
};

// Add created post
exports.addCreatedPost = async (req, res) => {
  try {
    const { email } = req.params;
    const { postId, postType } = req.body;
    console.log('Add Post - Request:', { email, postId, postType });

    if (!postId || !postType) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['postId', 'postType']
      });
    }

    const updateField = {
      'Offer Help': 'createdHelpPosts',
      'Ask for Help': 'createdAskPosts',
      'Story': 'createdStories'
    }[postType];

    if (!updateField) {
      return res.status(400).json({ 
        message: 'Invalid post type',
        validTypes: ['Offer Help', 'Ask for Help', 'Story']
      });
    }

    const user = await UserProfile.findOneAndUpdate(
      { email },
      { 
        $addToSet: { [updateField]: postId },
        $inc: { [`stats.${updateField.replace('created', '').toLowerCase()}Count`]: 1 }
      },
      { new: true }
    );

    if (!user) {
      console.log('Add Post - User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Add Post - Success:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Add Post - Error:', error);
    res.status(500).json({ message: 'Error adding created post', error: error.message });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Get Preferences - Request:', {
      email,
      params: req.params
    });

    const user = await UserProfile.findOne({ email });
    console.log('Get Preferences - User Check:', user);

    if (!user) {
      console.log('Get Preferences - User not found:', email);
      return res.status(404).json({ message: 'User profile not found' });
    }

    console.log('Get Preferences - Success:', user.preferences);
    res.json(user.preferences);
  } catch (error) {
    console.error('❌ Get Preferences - Error:', error);
    res.status(500).json({ message: 'Error getting preferences', error: error.message });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { email } = req.params;
    const { preferences } = req.body;
    console.log('Update Preferences - Request:', {
      email,
      preferences,
      params: req.params,
      body: req.body
    });

    // First check if user exists
    const existingUser = await UserProfile.findOne({ email });
    console.log('Update Preferences - Existing User Check:', existingUser);

    if (!existingUser) {
      console.log('Update Preferences - User not found:', email);
      return res.status(404).json({ message: 'User profile not found. Please create a profile first.' });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { email },
      { $set: { preferences } },
      { new: true, runValidators: true }
    );
    console.log('Update Preferences - Success:', profile);

    res.json(profile);
  } catch (error) {
    console.error('❌ Update Preferences - Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Get All Users - Request received');
    
    const users = await UserProfile.find({})
      .select('-__v') // Exclude version key
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    
    console.log('Get All Users - Success:', { count: users.length });
    res.json(users);
  } catch (error) {
    console.error('❌ Get All Users - Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile using JWT token
exports.getProfile = async (req, res) => {
  try {
    console.log('Get Profile - Request received');
    
    const userInfo = getUserFromToken(req);
    console.log('Get Profile - User info from token:', userInfo);
    
    const user = await UserProfile.findOne({ email: userInfo.email });
    if (!user) {
      console.log('Get Profile - User not found:', userInfo.email);
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    console.log('Get Profile - Success:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Get Profile - Error:', error);
    if (error.message === 'No authorization token provided') {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update user profile using JWT token
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update Profile - Request received');
    console.log('Update Profile - Request body:', req.body);
    
    const userInfo = getUserFromToken(req);
    console.log('Update Profile - User info from token:', userInfo);
    
    // Get values from request body
    const updates = {
      name: req.body.name,
      userType: req.body.userType,
      age: req.body.age,
      languages: req.body.languages || [],
      profileImage: req.body.profileImage,
      location: req.body.location,
      lastActive: new Date()
    };
    
    console.log('Update Profile - Updates:', updates);
    
    // Validate required fields
    if (!updates.name || !updates.userType) {
      console.log('Update Profile - Missing required fields:', {
        hasName: !!updates.name,
        hasUserType: !!updates.userType,
        body: req.body
      });
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'userType']
      });
    }

    // Clean up updates
    const cleanedUpdates = {
      email: userInfo.email, // Add email to the updates
      name: updates.name,
      age: updates.age,
      userType: updates.userType,
      languages: updates.languages,
      profileImage: updates.profileImage,
      location: updates.location,
      lastActive: new Date()
    };

    // Remove undefined values
    Object.keys(cleanedUpdates).forEach(key => 
      cleanedUpdates[key] === undefined && delete cleanedUpdates[key]
    );
    console.log('Update Profile - Final updates:', cleanedUpdates);

    console.log('Update Profile - Attempting database operation');
    const user = await UserProfile.findOneAndUpdate(
      { email: userInfo.email },
      { $set: cleanedUpdates },
      { 
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Update Profile - Success:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Update Profile - Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.message === 'No authorization token provided') {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    res.status(500).json({ 
      message: 'Error updating user profile', 
      error: error.message 
    });
  }
}; 