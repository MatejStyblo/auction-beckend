import Auction from "../models/Auction.js";

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("✅ Připojen nový klient");

    // Klient požádá o aktuální aukci po připojení
    socket.on("auction:request", async () => {
      try {
        const auction = await Auction.findOne();
        if (auction) {
          socket.emit("auction:current", auction);
        } else {
          socket.emit("auction:current", null);
        }
      } catch (err) {
        console.error("❌ Chyba při získávání aukce:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Klient odpojen");
    });
  });
}
