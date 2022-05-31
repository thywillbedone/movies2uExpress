const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");
require("dotenv/config");

const sendJSONresponse = (res, status, content) => {
  res.status(status).json(content);
};

/* GET /movies */
const moviesFindAll = (req, res) => {
  Movies.find({}).exec((err, movies) => {
    if (!movies) {
      sendJSONresponse(res, 404, { message: "movies not found" });
    } else if (err) {
      sendJSONresponse(res, 406, err._message);
    } else {
      sendJSONresponse(res, 200, movies);
    }
  });
};

/* POST /movies */
const moviesCreate = (req, res) => {
  if (!req.body.title) {
    return res.status(422).json({
      message: "invalid movie data",
    });
  } else {
    const parseTitle = String(req.body.title);
    const parseYear = req.body.year;
    const parseGenre = String(req.body.genre);
    const parsePoster = String(req.body.poster);
    const parseRating = req.body.rating;
    const parseLat = parseFloat(req.body.lat);
    const parseLng = parseFloat(req.body.lng);

    Movies.create(
      {
        title: parseTitle,
        year: parseYear,
        genre: parseGenre,
        poster: parsePoster,
        rating: parseRating,
        coords: [parseLng, parseLat],
      },
      (err, movie) => {
        if (err) {
          sendJSONresponse(res, 422, err._message);
        } else {
          sendJSONresponse(res, 201, movie);
        }
      }
    );
  }
};

/* GET /movies/:movieid */
const moviesReadOne = (req, res) => {
  if (!req.params.movieid) {
    sendJSONresponse(res, 406, { message: "Not found, movieid is required" });
  }
  Movies.findById(req.params.movieid).exec((err, movie) => {
    if (!movie) {
      return res.status(404).json({
        message: "movie not found",
      });
    } else if (err) {
      sendJSONresponse(res, 406, err._message);
    }
    res.status(200).json(movie);
  });
};

/* PUT /movies/:moviesid */
const moviesUpdateOne = (req, res) => {
  if (!req.body.title || !req.params.movieid) {
    return res.status(422).json({
      message: "invalid movie data",
    });
  } else {
    const parseTitle = String(req.body.title);
    const parseYear = req.body.year;
    const parseGenre = String(req.body.genre);
    const parsePoster = String(req.body.poster);
    const parseRating = req.body.rating;
    const parseLat = parseFloat(req.body.lat);
    const parseLng = parseFloat(req.body.lng);
    Movies.findOneAndUpdate({ id: req.params.movieid }, { new: true }).exec(
      (err, movie) => {
        if (!movie) {
          sendJSONresponse(res, 404, { message: "movie not found" });
        } else if (err) {
          sendJSONresponse(res, 406, err._message);
        }
        movie.title = parseTitle;
        movie.year = parseYear;
        movie.genre = parseGenre;
        movie.poster = parsePoster;
        movie.rating = parseRating;
        (movie.coords = [parseLat, parseLng]),
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
  }
};

/* DELETE movies/:movieid */
const moviesDeleteOne = (req, res) => {
  const movieid = req.params.movieid;
  if (movieid) {
    Movies.findByIdAndRemove(movieid).exec((err, movieid) => {
      if (err) {
        sendJSONresponse(res, 406, err._message);
      }
      console.log("movie id " + movieid + " deleted");
      sendJSONresponse(res, 204, null);
    });
  } else {
    sendJSONresponse(res, 404, { message: "Missing movie to delete" });
  }
};

module.exports = {
  moviesFindAll,
  moviesCreate,
  moviesReadOne,
  moviesUpdateOne,
  moviesDeleteOne,
};
