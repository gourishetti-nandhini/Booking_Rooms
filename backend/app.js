const express=require('express')
const app=express()
app.use(express.json())
const cors = require('cors')
app.use(cors({
  origin: "http://localhost:5173"
}));
// const {open}=require('sqlite')
// const sqlite3=require('sqlite3')
const path=require('path')
const Database = require("better-sqlite3");
let db = new Database("bookings.db");
const dbpath=path.join(__dirname,"bookings.db")
// let db=null;
const intializeserverdb=async()=>{
   try{
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    await db.exec(`
  CREATE TABLE IF NOT EXISTS Hotel (
  hotel_id INTEGER PRIMARY KEY,
  hotel_Name VARCHAR(200),
  location TEXT,
  description VARCHAR(300),
  price INTEGER,
  rating INTEGER
);

 CREATE TABLE IF NOT EXISTS Booking (
  hotel_id INTEGER,
  name TEXT,
  check_in DATE,
  check_out DATE,
  FOREIGN KEY (hotel_id) REFERENCES Hotel (hotel_id)
);
`);
const PORT = process.env.PORT || 3000;
    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    })
   }
   catch(error){
    console.log(error.message)
   }
}

intializeserverdb();

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/bookings/",async(request,response)=>{
 const query=`select * from Booking`;
//  const data = await db.all(query);
const data = db.prepare(query).all();
 response.send(data);
})

app.get("/hotel/",async(request,response)=>{
  const query=`select * from Hotel`;
  // const data = await db.all(query);
  const data = db.prepare(query).all();
  response.send(data);
})

app.post("/add-hotel",async(request,response)=>{
  const {hotelId,hotelName,location,description,price,rating}=request.body;
  const query=`INSERT INTO Hotel(hotel_id,hotel_Name,location,description,price,rating)
  Values(
  ${hotelId},
  '${hotelName}',
  '${location}',
  '${description}',
   ${price},
   ${rating}
  )`
// const data = await db.run(query)
const data = db.prepare(query).run();

response.send(data)
})


app.get("/single-hotel/:id",async(request,response)=>{
  const {id}=request.params;
  const query=`select * from Hotel where hotel_id=${id}`
  // const data = await db.all(query)
  const data = db.prepare(query).all();
  response.send(data)
})



app.post("/book/", async (request, response) => {
  try {
    const { hotel_id, name, check_in, check_out } = request.body;

    if (!hotel_id || !name || !check_in || !check_out) {
      return response.status(400).send("All fields are required");
    }

    if (check_in >= check_out) {
      return response.status(400).send("Invalid date range");
    }

    const checkQuery = `
      SELECT * FROM Booking
      WHERE hotel_id = ?
      AND (
        ? < check_out
        AND
        ? > check_in
      );
    `;

    const existingBookings = await db.all(checkQuery, [
      hotel_id,
      check_in,
      check_out,
    ]);

    if (existingBookings.length > 0) {
      return response.status(400).send("Room not available for selected dates");
    }

    const insertQuery = `
      INSERT INTO Booking (hotel_id, name, check_in, check_out)
      VALUES (? ,? , ?, ?);
    `;

    await db.run(insertQuery, [hotel_id, name, check_in, check_out]);

    response.send("Booking Confirmed");
  } catch (error) {
    response.status(500).send(error.message);
  }
});

