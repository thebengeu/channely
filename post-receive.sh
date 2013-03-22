#!/bin/sh
GIT_DIR=/ebs/channely.git GIT_WORK_TREE=/ebs/channely git checkout -f
cd /ebs/channely/meteor
mrt bundle ../channely.tgz
cd /ebs/channely
npm install
tar -zxvf channely.tgz
forever stop main.js
PORT=10001 MONGO_URL=mongodb://127.0.0.1:27017/meteor ROOT_URL=http://upthetreehouse.com forever start -a -l meteor_forever.log -o meteor_out.log -e meteor_err.log --sourceDir /ebs/channely/meteor/bundle main.js
forever stop app.js
PORT=10000 MONGO_URL=mongodb://127.0.0.1:27017/meteor forever start -a -l node_forever.log -o node_out.log -e node_err.log --sourceDir /ebs/channely app.js