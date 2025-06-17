import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";
import User from "../models/User.js";
import moment from "moment";

export const getBids = async (req, res) => {
    const bids = await Bid.find().sort({ time: -1 });
    res.json(bids);
};

// GET aktuální cenu
export const getPrice = async (req, res) => {
    const auction = await Auction.findOne();
    if (!auction) return res.json({ price: 0 });
    res.json({ price: auction.price });
  };
  
  // POST - ruční změna ceny
  export const setPrice = async (req, res) => {
    const { price } = req.body;
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "Neplatná cena" });
    }

    let auction = await Auction.findOne();
    if (!auction) {
      auction = new Auction({ price });
    } else {
      auction.price = price;
    }

    await auction.save();

    req.io.emit("price-updated", auction.price); // <---- přidáno

    res.json({ success: true, price: auction.price });
  };
  
  // POST - nový příhoz
  // POST - nový příhoz
  export const createBid = async (req, res) => {
    const username = req.user?.username;
    if (!username) {
      return res.status(401).json({ error: "Nepřihlášený uživatel" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Uživatel nenalezen" });
    }

    const { amount } = req.body; // amount = příhoz
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Neplatná částka" });
    }

    let auction = await Auction.findOne();
    if (!auction) {
      return res.status(400).json({ error: "Aukce není nastavena." });
    }

    const now = moment();
    const endDate = new Date(auction.endDate);
    if (now > endDate) {
      return res
        .status(400)
        .json({ error: "Aukce již skončila, nelze přihodit." });
    }

    const { price, minimumBid } = auction; // např. price=10000, minimumBid=5000

    // Kontrola příhozu
    if (amount < minimumBid) {
      return res.status(400).json({
        error: `Příhoz musí být alespoň ${minimumBid} Kč.`,
      });
    }

    const newPrice = price + amount; // např. 10000 + 5000 = 15000
    auction.price = newPrice;

    const currentEnd = moment(auction.endDate);
    const diffInMinutes = currentEnd.diff(now, "minutes");

    if (diffInMinutes < 5) {
      const newEndDate = now.add(5, "minutes").toDate();
      auction.endDate = newEndDate;
      req.io.emit("endDate-updated", newEndDate);
    }

    await auction.save();

    const bid = new Bid({
      amount: newPrice, // můžeš uložit novou cenu, nebo pokud chceš příhoz, přidej další pole
      time: new Date(),
      name: user.username,
      userId: user.userId,
    });

    await bid.save();

    req.io.emit("auction:current", auction);
    req.io.emit("new-bid", bid);
    req.io.emit("price-updated", newPrice);

    res.status(201).json(bid);
  };
  
  
export const getStartingPriceValue = () => price;
