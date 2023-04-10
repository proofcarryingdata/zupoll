# Zuzalu Confessions

## For Developers: Local Development

### Environment Variables

In order to develop locally, you will need to set some environment variables.
In `confessions-client` prroject, we have included an example
environment variable file here: [apps/confessions-client/.env.local.example](apps/confessions-client/.env.local.example). 
In order to make the `confessions-client` use these environment variables, you will need to copy the contents of the example file into an adjacent file called `.env.local`.
In `confessions-server` prroject, we have included an example
environment variable file here: [apps/confessions-server/.env.example](apps/confessions-server/.env.example). 
In order to make the `confessions-server` use these environment variables, you will need to copy the contents of the example file into an adjacent file called `.env`.

### Running the project

Note, this project depends on the [Zuzalu Passport project](https://github.com/proofcarryingdata/zupass).
You have to make sure the passport server and client running first.

In the root of this project, execute the following to start the servers and static sites locally.

```bash
# installs dependencies for all apps and packages in this repository
yarn

# prepare local Postgres - you must have Postgres installed for this
# to work properly.
yarn db:generate && yarn dbb:push

# starts all the applications contained in the `/apps` directory of the
# repository. this includes the confessions server and client.
yarn dev

# open up the confessions app in your browser.
open http://localhost:3004
```
