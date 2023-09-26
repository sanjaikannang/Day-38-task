const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// In-memory data store for rooms and bookings
const rooms = [];
const bookings = [];

// 1. Creating a room
app.post('/rooms', (req, res) => {
  const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;
  const room = {
    roomName,
    seatsAvailable,
    amenities,
    pricePerHour,
    roomId: rooms.length + 1,
  };
  rooms.push(room);
  res.status(201).json(room);
});

// 2. Booking a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  const room = rooms.find((r) => r.roomId === roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const booking = {
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    bookingId: bookings.length + 1,
    bookingDate: new Date(),
    bookingStatus: 'Booked',
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

// 3. List all rooms with booked dates
app.get('/rooms', (req, res) => {
  const roomList = rooms.map((room) => {
    const isBooked = bookings.some(
      (booking) => booking.roomId === room.roomId && booking.date === req.query.date
    );

    return {
      roomName: room.roomName,
      bookedStatus: isBooked ? 'Booked' : 'Available',
      customerName: isBooked ? bookings.find((booking) => booking.roomId === room.roomId && booking.date === req.query.date).customerName : null,
      date: req.query.date,
      startTime: isBooked ? bookings.find((booking) => booking.roomId === room.roomId && booking.date === req.query.date).startTime : null,
      endTime: isBooked ? bookings.find((booking) => booking.roomId === room.roomId && booking.date === req.query.date).endTime : null,
    };
  });

  res.status(200).json(roomList);
});

// 4. List all customers with booked dates
app.get('/customers', (req, res) => {
  const customerList = bookings
    .filter((booking) => booking.date === req.query.date)
    .map((booking) => {
      const room = rooms.find((r) => r.roomId === booking.roomId);
      return {
        customerName: booking.customerName,
        roomName: room ? room.roomName : null,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      };
    });

  res.status(200).json(customerList);
});

// 5. List how many times a customer has booked a room
app.get('/customer/bookings', (req, res) => {
  const { customerName } = req.query;

  const customerBookings = bookings.filter(
    (booking) => booking.customerName === customerName
  );

  res.status(200).json(customerBookings);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
