const express = require("express");
const { createBookingService } = require("./bookings");
const { findFreeSlots } = require("./slots");
const defaultRooms = require("../data/rooms.json");

function createApp(rooms = defaultRooms) {
  const app = express();
  const service = createBookingService(rooms);
  app.use(express.json());

  app.get("/api/rooms", (req, res) => res.json(rooms));

  app.get("/api/rooms/:id/bookings", (req, res) => {
    res.json(service.list(req.params.id, req.query.date));
  });

  app.get("/api/rooms/:id/free", (req, res) => {
    const room = service.rooms(req.params.id);
    const min = Number(req.query.min) || 45;
    res.json(findFreeSlots(service.list(room.id, req.query.date), room.opens, room.closes, min));
  });

  app.post("/api/bookings", (req, res) => {
    res.status(201).json(service.create(req.body));
  });

  app.delete("/api/bookings/:id", (req, res) => {
    service.cancel(Number(req.params.id));
    res.status(204).end();
  });

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.expose ? err.message : "Внутрішня помилка" });
  });
  return app;
}

module.exports = { createApp };
