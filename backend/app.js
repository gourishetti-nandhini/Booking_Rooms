const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors({
  origin: "*", 
}));

const path = require("path");
const Database = require("better-sqlite3");


const dbpath = path.join(__dirname, "bookings.db");
const db = new Database(dbpath);


db.exec(`
  CREATE TABLE IF NOT EXISTS Hotel (
    hotel_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_Name TEXT,
    location TEXT,
    description TEXT,
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.get("/", (req, res) => {
  res.send("Backend Running");
});



app.get("/bookings/", (req, res) => {
  const data = db.prepare("SELECT * FROM Booking").all();
  res.send(data);
});



app.get("/hotel/", (req, res) => {
  const data = db.prepare("SELECT * FROM Hotel").all();
  res.send(data);
});



app.post("/add-hotel", (req, res) => {
  const { hotelId, hotelName, location, description, price, rating } = req.body;

  const query = `
    INSERT INTO Hotel (hotel_id, hotel_Name, location, description, price, rating)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = db.prepare(query).run(
    hotelId,
    hotelName,
    location,
    description,
    price,
    rating
  );

  res.send(result);
});



app.get("/single-hotel/:id", (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM Hotel WHERE hotel_id = ?`;
  const data = db.prepare(query).all(id);

  res.send(data);
});



app.post("/book/", (req, res) => {
  try {
    const { hotel_id, name, check_in, check_out } = req.body;

  
    if (!hotel_id || !name || !check_in || !check_out) {
      return res.status(400).send("All fields are required");
    }

    if (check_in >= check_out) {
      return res.status(400).send("Invalid date range");
    }

    
    const checkQuery = `
      SELECT * FROM Booking
      WHERE hotel_id = ?
      AND (? < check_out AND ? > check_in)
    `;

    const existingBookings = db
      .prepare(checkQuery)
      .all(hotel_id, check_in, check_out);

    if (existingBookings.length > 0) {
      return res.status(400).send("Room not available for selected dates");
    }

  
    const insertQuery = `
      INSERT INTO Booking (hotel_id, name, check_in, check_out)
      VALUES (?, ?, ?, ?)
    `;

    db.prepare(insertQuery).run(
      hotel_id,
      name,
      check_in,
      check_out
    );

    res.send("Booking Confirmed");

  } catch (error) {
    res.status(500).send(error.message);
  }
});