module.exports = {
  apps: [{
    name: 'trussers-backend',
    script: 'server/index.js',
    cwd: '/root/prototypes/trussersweb',
    env: {
      NODE_ENV: 'production',
      RAZORPAY_KEY_ID: 'rzp_live_RxLyTuY6oOUQTk',
      RAZORPAY_KEY_SECRET: '2HKU6xID1T4TyTtn9RfPRekV',
      // SMTP Configuration for email notifications
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: '587',
      SMTP_USER: 'pejuangm781@gmail.com',
      SMTP_PASS: 'enfrqrgzgdfqfbnz',
      SMTP_FROM: 'Trusser <pejuangm781@gmail.com>',
      SMTP_SECURE: 'false'
    }
  }]
};
