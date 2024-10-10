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
  curl -fsSl https://bun.sh/install | bash -s "bun-v1.1.29"
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
STATE_FILE=$APP_DIR/shared/state

cd $APP_DIR || exit

get_active_deployment() {
    if [[ -f $STATE_FILE ]]; then
        grep -oP '^active: \K.*' "$STATE_FILE"
    else
        echo $DEFAULT_ACTIVE_DEPLOYMENT
    fi
}

update_deployment_state() {
    echo "active: $1" > "$STATE_FILE"
    echo "inactive: $2" >> "$STATE_FILE"
}

echo "Determining active deployment"
ACTIVE_DEPLOYMENT=$(get_active_deployment)
if [[ $ACTIVE_DEPLOYMENT == "blue" ]]; then
    export NEW_ACTIVE="green"
    export NEW_INACTIVE="blue"
else
    export NEW_ACTIVE="blue"
    export NEW_INACTIVE="green"
fi

echo "Deploying to new environment: $NEW_ACTIVE"

echo "Unarchiving new app build"
tar -xzf tmp/build.tar.gz -C tmp/ && rm -f tmp/build.tar.gz
rsync -a --delete tmp/build/ "$NEW_ACTIVE/"
rm -rf tmp/build

echo "Setting up environment"
set -a
source "$NEW_ACTIVE/app.env"
source shared/deployment.env
set +a

echo "Starting new app"
if [[ $NEW_ACTIVE == "blue" ]]; then
  APP_PORT=$BLUE_UPSTREAM
else
  APP_PORT=$GREEN_UPSTREAM
fi
cd "$APP_DIR/$NEW_ACTIVE" || exit
PORT=$APP_PORT pm2 start --name "arena-$NEW_ACTIVE" "bun" -- server.js

echo "Waiting for the app to start"
sleep 1

echo "Updating proxy upstream and reloading"
cd "$APP_DIR/shared" || exit
envsubst \$APP_HOST,\$NEW_ACTIVE,\$BLUE_UPSTREAM,\$GREEN_UPSTREAM,\$APP_STATIC_PATH < nginx.conf.template > arena.conf
sudo ln -sf "$(pwd)/arena.conf" /etc/nginx/sites-enabled/arena.conf
sudo nginx -t
sudo nginx -s reload

echo "Cleaning up"
pm2 stop "arena-$NEW_INACTIVE"
pm2 delete "arena-$NEW_INACTIVE"
pm2 save

echo "New Active Deployment: $NEW_ACTIVE"
update_deployment_state "$NEW_ACTIVE" "$NEW_INACTIVE"
