const { response } = require("../middlewares/response");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { generateToken, generateRefreshToken } = require("../helpers/jwt");
const modelUser = require("../models/user");
const emailer = require("../middlewares/emailer");

const Port = process.env.PORT;
const Host = process.env.HOST;

const userController = {
  register: async (req, res) => {
    let email = req.body.email;
    let {
      rows: [users],
    } = await modelUser.findEmail(email);
    if (users) {
      return response(res, 403, false, null, "Email already registered");
    }
    let digits = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    let password = bcrypt.hashSync(req.body.password);
    let data = {
      id: uuidv4(),
      email: email,
      password,
      otp,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      address: req.body.address,
    };
    try {
      const result = await modelUser.createUser(data);
      if (result) {
        let verifyUrl = `http://${Host}:${Port}/users/${req.body.email}/${otp}`;
        let text = `Hello Mr. ${req.body.lastname} \n Thank you for join us. Plese verification your email by clicking on the following link ${verifyUrl}`;
        const subject = `${otp} is your otp`;
        let sendEmail = emailer(email, subject, text);
        if (sendEmail == "Email not send") {
          return response(res, 400, false, null, "Register failed");
        }
        response(
          res,
          200,
          true,
          { email: data.email },
          "Register success, please check your email to verification your account"
        );
      }
    } catch (err) {
      console.log("Register error", err);
      response(res, 400, false, err, "Register failed");
    }
  },
  verificationOtp: async (req, res) => {
    const { email, otp } = req.body;
    const {
      rows: [users],
    } = await modelUser.findEmail(email);
    if (!users) {
      return response(res, 400, false, null, "Email not found");
    }
    if (users.otp == otp) {
      const result = await modelUser.verification(req.body.email);
      return response(res, 200, true, {}, "Verification account success");
    }
    return response(res, 400, false, nulll, "Invalid otp");
  },
  login: async (req, res) => {
    try {
      const email = req.body.email;
      console.log("email for login", email);
      let {
        rows: [users],
      } = await modelUser.findEmail(email);
      if (!users) {
        return response(res, 400, false, null, "Email not found");
      }
      const password = req.body.password;
      const validation = bcrypt.compareSync(password, users.password);
      if (!validation) {
        return response(res, 400, false, null, "Invalid password");
      }
      delete users.password;
      let fullname = users.firstname + " " + users.lastname;
      console.log("fullname", fullname);
      let payload = {
        id: users.id,
        fullname: fullname,
        email: users.email,
      };
      let accessToken = generateToken(payload);
      let refreshToken = generateRefreshToken(payload);
      users.token = accessToken;
      users.refreshToken = refreshToken;
      response(res, 200, true, users, "Login user success");
    } catch (err) {
      return response(res, 400, false, err, "Login user failed");
    }
  },
  get: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const sortby = req.query.sortby || "id";
      const sortorder = req.query.sortorder || "desc";
      const search = req.query.search || "";
      const offset = (page - 1) * limit;
      const result = await modelUser.getUser({
        search,
        sortby,
        sortorder,
        limit,
        offset,
      });
      const {
        rows: [count],
      } = await modelUser.countUser();
      const totalData = parseInt(count.total);
      const totalPage = Math.ceil(totalData / limit);
      const pagination = {
        currentPage: page,
        limit,
        totalData,
        totalPage,
      };
      response(
        res,
        200,
        true,
        { result: result.rows, pagination: pagination },
        "Get user success"
      );
    } catch (err) {
      console.log("Get user error", err);
      response(res, 400, false, null, "Get user failed");
    }
  },
};

exports.userController = userController;
