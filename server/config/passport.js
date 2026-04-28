const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        if (profile.emails && profile.emails.length > 0) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user if not found
        const role = req.query.state || 'customer';
        user = new User({
          name: profile.displayName,
          email: profile.emails ? profile.emails[0].value : `${profile.id}@google.com`,
          googleId: profile.id,
          role: role
        });

        await user.save();
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
