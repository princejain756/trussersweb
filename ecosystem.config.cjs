module.exports = {
  apps: [{
    name: 'trussers-backend',
    script: 'server/index.js',
    cwd: '/root/prototypes/trussersweb',
    env: {
      NODE_ENV: 'production',
      RAZORPAY_KEY_ID: 'rzp_live_RxLyTuY6oOUQTk',
      RAZORPAY_KEY_SECRET: '2HKU6xID1T4TyTtn9RfPRekV'
    }
  }]
};
