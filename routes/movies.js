const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middleware/authentication");
const axios = require("../axiosClient");
const redis = require("../redis");
const movie = require("../models/movies");

const TREND = [
  {
    title: "Upcoming movies",
    path: "/movie/upcoming",
  },
  {
    title: "Top trending",
    path: "/movie/popular",
  },
  {
    title: "Top rated",
    path: "/movie/top_rated",
  },
];

router.use(express.json());

router.get("/", async (req, res) => {
  console.log("GET request received on /route");

  const response = await movie.find({});

  return res.status(200).json(response);
});

router.get("/search", async (req, res) => {
  console.log("GET request received on /search route");
  try {
    const { term } = req.query;

    const cache = await redis.get(`search_${term}`);

    if (cache) {
      console.log("GET request served with cache", JSON.parse(cache));
      return res.status(200).json(JSON.parse(cache));
    }

    if (!term) {
      res.status(422).json({ message: "Invalid input" });
      return;
    }

    const { data: response } = await axios.get("/search/movie", {
      params: {
        query: term,
      },
    });

    console.log("GET request served with api call");

    try {
      await redis.set(`search_${term}`, JSON.stringify(response.results));
    } catch (error) {
      console.log("Error while updating cache: ", error.message);
    }

    res.status(200).json(response.results);
  } catch (err) {
    console.log("Error occurred:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/genre", async (req, res) => {
  console.log("GET request received on /genre route");
  try {
    const page = req.query.page;
    const genre = req.query.genre;

    const cache = await redis.get(`genre_${genre}:${page}`);

    if (cache) {
      console.log("GET request served with cache", JSON.parse(cache));
      return res.status(200).json(JSON.parse(cache));
    }

    if (isNaN(page) || isNaN(genre)) {
      res.status(422).json({ message: "Invalid parameters" });
      return;
    }

    const response = await axios.get("/discover/movie", {
      params: {
        page,
        with_genres: genre,
      },
    });

    console.log("GET request served with api call");

    try {
      await redis.set(`genre_${genre}:${page}`, JSON.stringify(response.data));
    } catch (error) {
      console.log("Error while updating cache: ", error.message);
    }

    res.status(200).json(response.data);
  } catch (err) {
    console.log("Error occurred:", err.message);
    if (err.response) {
      // Handle HTTP response errors
      res
        .status(err.response.status)
        .json({ message: err.response.statusText });
    } else if (err.code === "ECONNABORTED") {
      // Handle timeout errors
      res.status(504).json({ message: "Request timed out" });
    } else {
      // General error handling
      res.status(500).json({ message: "An error occurred" });
    }
  }
});

router.get("/:id", async (req, res) => {
  console.log("GET request received on /:id route");
  try {
    const movieId = req.params.id;

    const cache = await redis.get(`movie_${movieId}`);

    if (cache) {
      console.log("GET request served with cache");
      return res.status(200).json(JSON.parse(cache));
    }

    const response = await movie.findById(movieId);

    if (!response) {
      return res.sendStatus(404);
    }

    console.log("GET request served with api call");

    try {
      await redis.set(`movie_${movieId}`, JSON.stringify(response.data));
    } catch (error) {
      console.log("Error while updating cache: ", error.message);
    }

    res.status(200).json(response.data);
  } catch (err) {
    console.log("Error occurred:", err.message);
    res.status(500).json({ message: err.message });
  }
});

function getCrewDetails(cast, crew) {
  const crewDetails = {
    cast: [],
    directors: [],
    producers: [],
    writers: [],
  };

  cast.forEach((element) => {
    if (element["known_for_department"].localeCompare("Acting") === 0) {
      crewDetails.cast.push(element);
    }
  });

  crew.forEach((element) => {
    switch (element["known_for_department"]) {
      case "Directing":
        crewDetails.directors.push(element);
        break;
      case "Production":
        crewDetails.producers.push(element);
        break;
      case "Writing":
        crewDetails.writers.push(element);
        break;
      default:
        break;
    }
  });

  return crewDetails;
}

module.exports = router;
