const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./prisma');

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
        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;
          user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id }
            });
            return done(null, user);
          }
        }

        // Create new user if not found
        const role = req.query.state || 'customer';
        user = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: profile.emails ? profile.emails[0].value : `${profile.id}@google.com`,
            googleId: profile.id,
            role: role
          }
        });

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
