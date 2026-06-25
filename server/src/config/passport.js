const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Kiểm tra và import các strategies tùy chọn
let GoogleStrategy, FacebookStrategy;
try {
  GoogleStrategy = require('passport-google-oauth20').Strategy;
} catch (error) {
  console.warn('⚠️ Google OAuth not installed');
}

try {
  FacebookStrategy = require('passport-facebook').Strategy;
} catch (error) {
  console.warn('⚠️ Facebook OAuth not installed');
}

// ============================================
// LOCAL STRATEGY (Email/Password)
// ============================================
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is disabled' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ============================================
// JWT STRATEGY
// ============================================
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      if (!user.isActive) {
        return done(null, false, { message: 'Account is disabled' });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// ============================================
// GOOGLE OAUTH 2.0 STRATEGY (Optional)
// ============================================
if (GoogleStrategy && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({
            $or: [
              { email: profile.emails[0].value },
              { 'google.id': profile.id }
            ]
          });

          if (existingUser) {
            if (!existingUser.google || !existingUser.google.id) {
              existingUser.google = {
                id: profile.id,
                accessToken: accessToken,
                refreshToken: refreshToken
              };
              await existingUser.save();
            }
            return done(null, existingUser);
          }

          const newUser = new User({
            name: profile.displayName || profile.name.givenName,
            email: profile.emails[0].value,
            google: {
              id: profile.id,
              accessToken: accessToken,
              refreshToken: refreshToken
            },
            avatar: profile.photos[0]?.value || null,
            isActive: true,
            emailVerified: true
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// ============================================
// FACEBOOK OAUTH STRATEGY (Optional)
// ============================================
if (FacebookStrategy && process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'photos', 'email'],
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({
            $or: [
              { email: profile.emails[0]?.value },
              { 'facebook.id': profile.id }
            ]
          });

          if (existingUser) {
            if (!existingUser.facebook || !existingUser.facebook.id) {
              existingUser.facebook = {
                id: profile.id,
                accessToken: accessToken,
                refreshToken: refreshToken
              };
              await existingUser.save();
            }
            return done(null, existingUser);
          }

          const newUser = new User({
            name: profile.displayName,
            email: profile.emails[0]?.value || `${profile.id}@facebook.com`,
            facebook: {
              id: profile.id,
              accessToken: accessToken,
              refreshToken: refreshToken
            },
            avatar: profile.photos[0]?.value || null,
            isActive: true,
            emailVerified: true
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// ============================================
// SERIALIZE / DESERIALIZE
// ============================================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================
exports.authenticateJWT = passport.authenticate('jwt', { session: false });
exports.authenticateLocal = passport.authenticate('local', { session: false });

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Authentication required' });
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
};

module.exports = passport;