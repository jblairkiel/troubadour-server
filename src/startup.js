
let path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config.env') })
require('babel-polyfill');

// Shim to better deal with thrown exceptions :)
require('express');
require('express-async-errors');

export let database = require('../models');
