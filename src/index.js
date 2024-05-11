// require("dotenv").config({ path: "./env" });
// import mongoose from 'mongoose'
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";



dotenv.config({
  path: './env',
});

connectDB()
  .then(() => {
    console.log('Mongo Db is connected')
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running at port :${process.env.PORT}`);
    });
   
  })
  .catch((err) => {
    console.log("Mongo db connection failed !!! ", err);
  });
 

// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("Error: ", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("ERROR:", error);

//     throw error;
//   }
// })();
