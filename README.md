## This is a fork that i adapted to use with Cloud Firestore



# Algolia <-> Firebase cloud functions

[![npm](https://img.shields.io/npm/v/algolia-firebase-functions.svg)](https://www.npmjs.com/package/algolia-firebase-functions)

Useful library to keep your Firebase Database data in sync with [Algolia](https://algolia.com) for easy search.

Starting from version 2.0, this library supports Cloud Functions v1.0. If you need to support beta Cloud Functions, use version 1.0.3 instead.

## Installation

In your `functions` directory:

``` bash
 npm install --save algolia-firebase-functions 
```

## Usage

To use this library in your Functions, first of all you need to set environmental variables for Algolia to initialize connection. Grab your API keys [here](https://algolia.com/dashboard) first.

Open Terminal, go to your `functions` directory and input these commands:

``` bash
firebase functions:config:set algolia.app="<YOUR-ALGOLIA-APP-ID>"
firebase functions:config:set algolia.key="<YOUR-ALGOLIA-APP-PUBLIC-KEY>"
firebase functions:config:set algolia.index="<YOUR-ALGOLIA-INDEX-NAME>"
```
Then, in your functions' `index.js` file, paste the following lines:

``` js
const algoliasearch = require('algoliasearch');
const algoliaFunctions = require('algolia-firebase-functions');

const algolia = algoliasearch(functions.config().algolia.app,
                              functions.config().algolia.key);
 const index = algolia.initIndex(functions.config().algolia.index);

 exports.syncAlgoliaWithFirebase = functions.firestore.document('myref/{childRef}').onWrite(
    (change, context) => algoliaFunctions.syncAlgoliaWithFirebase(index, change);
 );
```

And redeploy your functions:

```bash
firebase deploy --only functions
```

Now, after any changes made with your references, it will be sent to Algolia, so you'll be sure that users can search on the newest data.
