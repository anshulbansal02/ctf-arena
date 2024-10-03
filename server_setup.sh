sudo apt update -y && sudo apt upgrade -y
sudo apt install unzip nginx postgresql-client -y

curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
node --version

bun install -g pm2

