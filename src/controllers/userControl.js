import User from "../models/User.js";
import Video from "../models/Video.js";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { json } from "express";
import session from "express-session";
import { render } from "pug";
import { populate } from "dotenv";
import { model } from "mongoose";

export const Getjoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postjoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "join";
  if (password !== password2)
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation doesnot match.",
    });
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists)
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken",
    });
  try {
    await User.create({
      name,
      username,
      email,
      password,
      password2,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const getlogin = (req, res) =>
  res.render("login", { pageTitle: "login" });
export const postLogin = async (req, res) => {
  const pageTitle = "Login";
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res
      .status(400)
      .render("login", {
        pageTitle,
        errorMessage: "An account with this username does not exists",
      });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    res.redirect("/login");
  }
};

export const getedit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit profile" });
};

export const postedit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, username, email, location },
    file,
  } = req;

  const monaName = req.session.user.name;
  const monaEmail = req.session.user.email;
  if (monaName !== name) {
    const exists = await User.exists({ $or: [{ name }] });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This name is already taken.",
      });
    }
  }
  if (monaEmail !== email) {
    const exists = await User.exists({ $or: [{ email }] });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This email is already taken.",
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      username,
      email,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/user/edit");
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getChangepassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("user/change-password", { pageTitle: "Change Password" });
};
export const postChangepassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("user/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("user/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  user.password = newPassword;
  await user.save();
  return res.redirect("/user/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("user/profile", { pageTitle: user.name, user });
};
