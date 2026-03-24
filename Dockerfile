###################################################
# Stage: base
# 
# This base stage ensures all other stages are using the same base image
# and provides common configuration for all stages, such as the working dir.
###################################################
FROM node:22 AS base
WORKDIR /usr/local/kstf-web

################## CLIENT STAGES ##################

###################################################
# Stage: client-base
#
# This stage is used as the base for the client-dev and client-build stages,
# since there are common steps needed for each.
###################################################
FROM base AS client-base
COPY reactjs/package.json reactjs/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY reactjs/index.html reactjs/vite.config.js ./
COPY reactjs/dist ./dist
COPY reactjs/public ./public
COPY reactjs/src ./src
COPY reactjs/.env ./

###################################################
# Stage: client-dev
# 
# This stage is used for development of the client application. It sets 
# the default command to start the Vite development server.
###################################################
FROM client-base AS client-dev
CMD ["npm", "run", "dev"]

###################################################
# Stage: client-build
#
# This stage builds the client application, producing static HTML, CSS, and
# JS files that can be served by the backend.
###################################################
FROM client-base AS client-build
RUN npm run build

FROM client-build AS client-prod
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]

###################################################
################  BACKEND STAGES  #################
###################################################

###################################################
# Stage: backend-base
#
# This stage is used as the base for the backend-dev and test stages, since
# there are common steps needed for each.
###################################################
FROM base AS backend-base
COPY expressjs/package.json expressjs/package-lock.json ./
RUN npm install
COPY expressjs/spec ./spec
COPY expressjs/src ./src
COPY expressjs/.env ./
RUN mkdir -p ./src/public/model
RUN mkdir -p ./src/public/dataset

FROM backend-base AS backend-dev
CMD ["npm", "run", "dev2"]

###################################################
# Stage: test
#
# This stage runs the tests on the backend. This is split into a separate
# stage to allow the final image to not have the test dependencies or test
# cases.
###################################################
FROM backend-dev AS backend-test
RUN npm run test

###################################################
# Stage: final
#
# This stage is intended to be the final "production" image. It sets up the
# backend and copies the built client application from the client-build stage.
#
# It pulls the package.json and package-lock.json from the test stage to ensure that
# the tests run (without this, the test stage would simply be skipped).
###################################################
FROM base AS final
ENV NODE_ENV=production
COPY --from=backend-base /usr/local/kstf-web/package.json /usr/local/kstf-web/package-lock.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force
COPY expressjs/src ./src
COPY --from=client-build /usr/local/kstf-web/dist ./src/static
RUN mkdir -p ./src/public/model
RUN mkdir -p ./src/public/dataset
EXPOSE 5172
CMD ["node", "src/index.js"]