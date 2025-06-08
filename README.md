
## Getting Started:

### Setting up next-app locally

First clone the repository locally, by running the following command

```
  git clone https://github.com/Prashant-Kumar7/younglabs.git
```

cd to react-app and backend directories to install dependencies by running

```
npm install
```



## Run Locally

### To Start backend

cd to backend directory, and run

```bash
  npx mikro-orm migration:create
  npx mikro-orm migration:up
```
This will bootstrap the backend with ability of Database connections

##### Note : create a .env at room level and store
```DATABASE_URL``` for db connections

#### To start in Dev mode

to start the backend in dev mode, run
```bash
  npm run dev
```

Then to build the backend app first. make sure you have typescript complier installed.

if not installed, then run ```npm install -g typescript```

```bash
  npm install -g typescript
```

Then build the backend app, run

```bash
  tsc -b
```

after building the app a dist folder will contain your complied backend.

to run app, run
```bash
  node dist/index.js
```
this will make your backend up and running Locally at port ```4000```

### To Start Frontend

cd to react-app directory, and run ```npm run dev``` to run the app in development mode.

if you want to build the app, run ```npm run build```. A dist folder will have all the files of complied frontend.

To run the complied frontend, run

```bash
  npm run start
```

this will make your frontend up and running Locally at port ```5173``` if started in dev mode. and at port ```4173``` if started in production mode  


## Appendix

Any additional information goes here

if you want you can setup a ```.env``` which will have the port number where the applications are running as a secret. 

```DATABSE_URL```
