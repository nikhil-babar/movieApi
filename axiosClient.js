const { default: axios } = require("axios");

const https = require("https");

const agent = new https.Agent({ keepAlive: true });

module.exports = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: process.env.API_KEY,
  },
  timeout: 10000,
  httpsAgent: agent,
});
