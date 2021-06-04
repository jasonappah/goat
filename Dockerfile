FROM node:14
COPY . /home/app
WORKDIR /home/app
RUN yarn
RUN yarn run build
CMD "yarn" "run" "start"
EXPOSE 3000
