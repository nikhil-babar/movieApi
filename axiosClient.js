const { default: axios } = require("axios");

const https = require("https");

const agent = new https.Agent({ keepAlive: true });

module.exports = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: "fe5484cb74a458c133c731cccb007eb1",
  },
  timeout: 10000,
  httpsAgent: agent,
});
