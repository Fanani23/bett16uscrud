const pool = require("../configs/db");

const createUser = (data) => {
  const { id, email, firstname, lastname, password, address, phone, otp } =
    data;
  console.log("data create user", data);
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO users (id, email, firstname, lastname, password, address, phone, otp) VALUES ('${id}', '${email}', '${firstname}', '${lastname}', '${password}', '${address}', '${phone}', '${otp}')`,
      (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      }
    );
  });
};

const findEmail = (email) => {
  console.log(email);
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM users WHERE email = '${email}'`, (err, res) => {
      if (!err) {
        resolve(res);
      } else {
        reject(err);
      }
    });
  });
};

const verification = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE users SET access = 1 WHERE email = '${email}'`,
      (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      }
    );
  });
};

const getUser = ({ search, sortby, sortorder, limit, offset }) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT users.id, users.firstname, users.lastname, users.email, users.phone, users.address FROM users WHERE users.firstname ILIKE ('%${search}%') ORDER BY users.${sortby} ${sortorder} LIMIT ${limit} OFFSET ${offset}`,
      (err, res) => {
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      }
    );
  });
};

const countUser = () => {
  return pool.query(`SELECT COUNT(*) AS total FROM users`);
};

module.exports = {
  createUser,
  findEmail,
  getUser,
  countUser,
  verification,
};
