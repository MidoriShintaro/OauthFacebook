const express = require("express");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const config = require("./config");
const routes = require("./routes");
const mongoose = require("mongoose");
const User = require("./model/user");
const app = express();
const port = process.env.PORT || 3000;

//connect db
mongoose.connect(config.dburi).then(() => console.log("Db connected"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); // sử dụng view ejs
app.use(cookieParser()); //Parse cookie
app.use(express.urlencoded({ extended: false })); //Parse body để get data
app.use(session({ secret: config.session_secret, key: "sid" })); //Save user login

// Passport session setup.
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id).then((user) => done(null, user));
});

// Sử dụng FacebookStrategy cùng Passport.
passport.use(
  new FacebookStrategy(
    {
      clientID: config.fb_key,
      clientSecret: config.fb_secret,
      callbackURL: config.callback_url,
    },
    async function (accessToken, refreshToken, profile, done) {
      // process.nextTick(function () {
      //   console.log(accessToken, refreshToken, profile, done);
      //   return done(null, profile);
      // });
      const currentUser = await User.findOne({ FbId: profile.id });
      if (currentUser) {
        return done(null, currentUser);
      } else {
        const newUser = await new User({
          FbId: profile.id,
          name: profile.displayName,
        }).save();
        return done(null, newUser);
      }
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);

app.listen(port, () => console.log("Sever listening on port: " + port));
