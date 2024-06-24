const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

//Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(password);
  const encryptedPassword = CryptoJS.AES.encrypt(
    password,
    process.env.PASSWORD
  ).toString();

  if (!username || !email || !password) {
    res.status(404).json('Please fill in all fields');
  }
  const newUser = new User({
    username,
    email,
    password: encryptedPassword,
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log(user);
    if (!user) {
      res.status(401).json('Wrong User Name');
    }
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    console.log(password, originalPassword);
    if (originalPassword != password) {
      return res.status(401).json('Wrong Password');
    }
    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: '3d',
      }
    );
    const { passwordDB, ...others } = user._doc;

    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
