const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  title: String,
  year: String,
  poster: String,
  released: String,
  runtime: String,
  genre: [String],
  directors: [String],
  writers: [String],
  actors: [String],
  plot: String,
  language: String,
  country: String,
  awards: String,
  production: String
});

const Movie = mongoose.model("Movie", movieSchema);

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) throw err;
    console.log("connected to mongo db");
  }
);

const create = async input => {
  try {
    console.log(`Trying to save ${input}`);

    Movie.find({ title: input.title, year: input.year }, null, null, function (err, docs) {
      if (err) {
        console.log(`Search of movie failed for the following error: ${err}`);
        throw err;
      }

      if(docs.length > 0) {
        console.log(`The movie ${input.title} already exist`);
        return
      }
      
      const movie = new Movie(input);

      movie.save(function(err) {
        if (err) throw err;
        console.log("Movie successfully saved.");
      });
      return true;
    });
  } catch (error) {
    console.log(`Save failed for the following error: ${error}`);
    throw error;
  }
};

process.on('exit', function(){
  console.log(`Closing mongoose connection`);
  mongoose.disconnect()
})

exports.create = create;
