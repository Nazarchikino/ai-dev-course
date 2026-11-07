const { EventEmitter } = require("node:events");

// Спільна шина подій застосунку
module.exports = new EventEmitter();
