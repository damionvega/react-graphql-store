const nodemailer = require('nodemailer');

// See postmark for sending emails in production
// See mgml.io for responsive email templating in React
// See juice to do inline styles

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;

const transport = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

const createEmail = text => `
  <div class="email" style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
  ">
    <h2>Hello!</h2>
    <p>${text}</p>

    <p>- Sick Fits</p>
  </div>
`;

exports.transport = transport;
exports.createEmail = createEmail;
