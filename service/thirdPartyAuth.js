const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/UsersModel");
const Profile = require("../models/ProfileModel");
const Follow = require("../models/FollowModel");

const { generateUrlJWT } = require("./generateJWT");

module.exports = (app, options) => {
  return {
    init: function () {
      passport.use(
        new GoogleStrategy(
          {
            clientID: options.googleAppId,
            clientSecret: options.googleAppSecret,
            callbackURL: `${options.baseUrl}/auth/google/callback`,
          },
          async (accessToken, refreshToken, profile, cb) => {
            try {
              const email = profile._json.email;
              const user = await User.findOne({ email });
              if (user) return cb(null, user);
              const newUser = await User.create({
                name: profile.displayName,
                email,
                password: "googleLogin",
                photo: profile._json.picture,
                isThirdPartyLogin: true,
              });
              const userId = newUser._id;
              await Profile.create({ user: userId });
              await Follow.create({ userId: userId });
              return cb(null, newUser);
            } catch (error) {
              if (error) return cb(error, null);
            }
          }
        )
      );
    },
    registerRoutes: () => {
      // register Google routes
      app.get(
        "/api/auth/google",
        passport.authenticate("google", { scope: ["profile", "email"] })
      );
      app.get(
        "/auth/google/callback",
        passport.authenticate("google", {
          session: false,
        }),
        async (req, res, next) => {
          try {
            generateUrlJWT(req.user, res);
          } catch (error) {
            next(error);
          }
          // we only get here on successful authentication
        }
      );
    },
  };
};
