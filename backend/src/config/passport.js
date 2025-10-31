const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const prisma = require('./database');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });
    
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails[0].value },
            { providerId: profile.id, provider: 'google' }
          ]
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            provider: 'google',
            providerId: profile.id
          }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      
      if (!email) {
        return done(new Error('No email found from GitHub'), false);
      }

      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { providerId: profile.id, provider: 'github' }
          ]
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos[0]?.value,
            provider: 'github',
            providerId: profile.id
          }
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
}

module.exports = passport;
