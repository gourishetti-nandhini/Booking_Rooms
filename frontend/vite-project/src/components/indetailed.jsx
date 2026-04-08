import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css";
import '../index.css'

const Indetailed = () => {
  const { id } = useParams(); 
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [hotelName, setHotelName] = useState(""); 

  useEffect(() => {
    const gettingdata = async () => {
      try {
        const data = await fetch(`${import.meta.env.VITE_API_URL}/single-hotel/${id}`);
        const response1 = await data.json();
        
        
        if (response1 && response1.length > 0) {
          setHotelName(response1[0].hotel_Name);
        }
      } catch (error) {
        console.error("Error fetching hotel:", error);
      }
    };
    gettingdata();
  }, [id]);

  const handleBooking = async () => {
   
    const bookingDetails = {
      hotel_id: id,
      name: hotelName, 
      check_in: checkIn.toISOString().split("T")[0],
      check_out: checkOut.toISOString().split("T")[0],
    };

    try {
   
      const response = await fetch(`${import.meta.env.VITE_API_URL}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingDetails),
      });


      if (response.ok) {
        alert("Booking Successful!");
      } else {
        
        const errorText = await response.text();
        alert(`Booking Failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Server is not responding.");
    }
  };
return (
  <div className="booking-page">
    <h2 className="booking-title"> Booking Details</h2>

    <div className="booking-container">
      <div className="booking-card">
        <p><strong>Hotel:</strong> {hotelName}</p>
        <p><strong>ID:</strong> {id}</p>

        <div className="input-group">
          <label>Check-In</label>
          <DatePicker
            selected={checkIn}
            onChange={(date) => setCheckIn(date)}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
          />
        </div>

        <div className="input-group">
          <label>Check-Out</label>
          <DatePicker
            selected={checkOut}
            onChange={(date) => setCheckOut(date)}
            dateFormat="yyyy-MM-dd"
            minDate={checkIn}
          />
        </div>

        <button className="btn" onClick={handleBooking}>
          Confirm Booking
        </button>
      </div>
    </div>
  </div>
);
};

export default Indetailed;