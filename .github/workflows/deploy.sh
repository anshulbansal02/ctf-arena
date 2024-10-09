#!/bin/bash
echo "Updating system packages"
export DEBIAN_FRONTEND=noninteractive
sudo apt update -y && sudo apt upgrade -y

echo "Installing Nginx if not present"
if ! command -v nginx &> /dev/null; then
  sudo apt install nginx -y
fi

# Install Bun
if ! command -v bun &> /dev/null; then
  sudo apt install unzip -y
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
  source ~/.bashrc
fi

# Install NVM
if ! command -v node &> /dev/null; then 
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
  bun install -g pm2
fi

echo "Setting up script"
APP_DIR=~/app
DEFAULT_ACTIVE_DEPLOYMENT=green
DEFAULT_INACTIVE_DEPLOYMENT=blue

cd $APP_DIR || exit

echo "Determining active deployment"
if [[ "$ACTIVE_DEPLOYMENT" == blue ]]; then
  export ACTIVE_DEPLOYMENT=green
  export INACTIVE_DEPLOYMENT=blue
elif [[ "$ACTIVE_DEPLOYMENT" == green ]]; then
  export ACTIVE_DEPLOYMENT=blue
  export INACTIVE_DEPLOYMENT=green
else
  export ACTIVE_DEPLOYMENT=$DEFAULT_ACTIVE_DEPLOYMENT
  export INACTIVE_DEPLOYMENT=$DEFAULT_INACTIVE_DEPLOYMENT
fi
echo "Deploying to new environment: $ACTIVE_DEPLOYMENT"

echo "Unarchiving new app build"
tar -xzf tmp/build.tar.gz -C tmp/ && rm -f tmp/build.tar.gz
rsync -a --delete tmp/build/ "$ACTIVE_DEPLOYMENT/"
rm -rf tmp/build

echo "Setting up environment"
set -a
source "$ACTIVE_DEPLOYMENT/app.env"
source shared/deployment.env
set +a

echo "Starting new app"
if [[ "$ACTIVE_DEPLOYMENT" == blue ]]; then
  APP_PORT=$BLUE_UPSTREAM
else
  APP_PORT=$GREEN_UPSTREAM
fi
cd "$APP_DIR/$ACTIVE_DEPLOYMENT" || exit
PORT=$APP_PORT pm2 start --name "arena-$ACTIVE_DEPLOYMENT" "bun" -- server.js

echo "Waiting for the app to start"
sleep 1

echo "Updating proxy upstream and reloading"
cd "$APP_DIR/shared" || exit
envsubst \$APP_HOST,\$ACTIVE_DEPLOYMENT,\$BLUE_UPSTREAM,\$GREEN_UPSTREAM,\$APP_STATIC_PATH < nginx.conf.template > arena.conf
sudo ln -sf "$(pwd)/arena.conf" /etc/nginx/sites-enabled/arena.conf
sudo nginx -t
sudo nginx -s reload

echo "Cleaning up"
pm2 stop "arena-$INACTIVE_DEPLOYMENT"
pm2 save

echo "New Active Deployment: $ACTIVE_DEPLOYMENT"
