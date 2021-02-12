FROM node:14.14.0

WORKDIR /usr/src/smart-brain-container

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]
