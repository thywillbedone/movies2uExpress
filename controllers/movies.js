require("dotenv/config");
const mongoose = require("mongoose");
const Movies = require("../models/movies");
const geocoder = require("../utils/geocoder");
const asyncHandler = require("express-async-handler");

const sendJSONresponse = (res, status, content) => {
  res.status(status).json(content);
};

/**
 * @desc List movies
 * @route GET /movies
 * @acces public */
const moviesFindAll = asyncHandler(async (req, res, next) => {
  try {
    const movies = await Movies.find();
    return res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (e) {
    res.status(500).json({
      error: "Server error",
    });
  }
});

/**
 * @desc Find movie by id
 * @route GET /movies/:movieid
 * @acces public */
const moviesReadOne = asyncHandler(async (req, res, next) => {
  try {
    const movie = await Movies.findById(req.params.movieid);
    return res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (e) {
    res.status(404).json({
      error: "movie not found",
    });
  }
});

/**
 * @desc Insert new movie
 * @route POST /movies
 * @acces private */
const moviesCreate = asyncHandler(async (req, res, next) => {
  if (!req.body.location) {
    sendJSONresponse(res, 400, { message: "location is required" });
  } else {
    try {
      const loc = await geocoder.geocode(req.body.location);
      const parseLocation = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedLocation: loc[0].formattedAddress,
      };
      const movie = await Movies.create({
        title: req.body.title,
        year: req.body.year,
        genre: req.body.genre,
        poster: req.body.poster,
        rating: req.body.rating,
        geoLocation: parseLocation,
      });
      return res.status(201).json({
        success: true,
        data: movie,
      });
    } catch (e) {
      res.status(406).json(e.message);
    }
  }
});

/**
 * @desc Update movie
 * @route PUT /movies/:moviesid
 * @acces private */
const moviesUpdateOne = asyncHandler(async (req, res, next) => {
  if (!req.body.location) {
    sendJSONresponse(res, 400, { message: "location is required" });
  } else {
    try {
      const loc = await geocoder.geocode(req.body.location);
      const parseLocation = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedLocation: loc[0].formattedAddress,
      };
      Movies.findOneAndUpdate({ id: req.params.movieid }, { new: true }).exec(
        (err, movie) => {
          if (!movie) {
            sendJSONresponse(res, 404, { message: "movie not found" });
          } else if (err) {
            sendJSONresponse(res, 406, err._message);
          }
          movie.title = req.body.title;
          movie.year = req.body.year;
          movie.genre = req.body.genre;
          movie.poster = req.body.poster;
          movie.rating = req.body.rating;
          movie.geoLocation = parseLocation;
          //not updating reviews via this endpoint1
          movie.save((err, movie) => {
            if (err) {
              sendJSONresponse(res, 406, err._message);
            } else {
              sendJSONresponse(res, 200, movie);
            }
          });
        }
      );
    } catch (e) {
      res.status(400).json(e.message);
    }
  }
});

/**
 * @desc Delete movie
 * @route DELETE movies/:movieid
 * @acces private */
const moviesDeleteOne = asyncHandler(async (req, res) => {
  try {
    await Movies.findByIdAndRemove(req.params.movieid);
    return res.status(204).json({
      success: true,
      movieid: req.params.movieid,
    });
  } catch (e) {
    res.status(404).json(e.message);
  }
});

module.exports = {
  moviesFindAll,
  moviesCreate,
  moviesReadOne,
  moviesUpdateOne,
  moviesDeleteOne,
};
