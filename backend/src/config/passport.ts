import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/UserMongoose.model';

passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Validate that required environment variables are present
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
    console.error('ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in environment variables');
    console.error('GOOGLE_CLIENT_ID:', googleClientId ? 'Set' : 'Missing');
    console.error('GOOGLE_CLIENT_SECRET:', googleClientSecret ? 'Set' : 'Missing');
    throw new Error('Missing required Google OAuth credentials. Please check your .env file.');
}

passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: '/api/auth/google/callback',
    passReqToCallback: true
},
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ email: profile.emails?.[0].value });

            const accountType = (req.session as any)?.accountType || 'individual';

            if (user) {
                // Link google ID if not linked
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
                return done(null, user);
            } else {
                // Create new user
                user = new User({
                    name: profile.displayName,
                    email: profile.emails?.[0].value,
                    password: 'google-oauth-dummy-password', // Will not be used for google login
                    googleId: profile.id,
                    role: accountType === 'business' || accountType === 'msme' ? 'manager' : 'operator',
                    department: 'General',
                    isActive: true
                });
                await user.save();
                return done(null, user);
            }
        } catch (err) {
            return done(err, false);
        }
    }
));

export default passport;