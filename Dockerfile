FROM node:14.14.0

WORKDIR /usr/src/smart-brain-container

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]

# FROM node:14.14.0

# Create app directory
# RUN mkdir -p /usr/src/smart-brain-container
# WORKDIR /usr/src/smart-brain-container

# Create app dependencies
# COPY package.json /usr/src/smart-brain-container
# RUN npm install

#  Bundle app source
# COPY . /usr/src/smart-brain-container

# Build arguments
# ARG NODE_VERSION=14.14.0

# Environment
#  ENV NODE_VERSION $NODE_VERSION


