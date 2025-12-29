#!/bin/bash
cd /root/prototypes/trussersweb
export NODE_ENV=production
export RAZORPAY_KEY_ID=rzp_live_RxLyTuY6oOUQTk
export RAZORPAY_KEY_SECRET=2HKU6xID1T4TyTtn9RfPRekV
node server/index.js
