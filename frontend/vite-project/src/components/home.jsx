import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'
const Home = () => {
  const [booking, setBookings] = useState([]);
  
  const navigate = useNavigate();
  const onButtonClick=(id)=>{
     navigate(`/details/${id}`);
  }

  useEffect(() => {
     const url = "http://localhost:3000/hotel";
      const getData = async () => {
      const data = await fetch(url);
      const response = await data.json();

   
      const formattedData = response.map(each => ({
        hotel_id: each.hotel_id,
        hotel_Name: each.hotel_Name,
      }));

      setBookings(formattedData);
    };

    getData();

  }, []);

 return (
  <div className="container">
    <h1 className="title">Hotel Booking System</h1>

    <div className="card-container">
      {booking.map((each) => (
        <div className="card" key={each.hotel_id}>
          <h2>{each.hotel_Name}</h2>
          <p>Hotel ID: {each.hotel_id}</p>

          <button
            className="btn"
            onClick={() => onButtonClick(each.hotel_id)}
          >
            Book Now
          </button>
        </div>
      ))}
    </div>
  </div>
);
};

export default Home;