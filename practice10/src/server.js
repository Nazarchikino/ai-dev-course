const { createApp } = require("./app");

const app = createApp();
app.listen(3000, () => console.log("library-service: http://localhost:3000"));
