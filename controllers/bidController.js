import Bid from "../models/Bid.js";
import Auction from "../models/Auction.js";
import User from "../models/User.js";

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
  export const createBid = async (req, res) => {
    const username = req.user?.username;
    if (!username) {
      return res.status(401).json({ error: "Nepřihlášený uživatel" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Uživatel nenalezen" });
    }

    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Neplatná částka" });
    }

    let auction = await Auction.findOne();
    if (!auction) {
      return res.status(400).json({ error: "Aukce není nastavena." });
    }

    const { price, minimumBid } = auction;

    if (amount < price + minimumBid) {
      return res.status(400).json({
        error: `Nabídka musí být alespoň o ${minimumBid} Kč vyšší než aktuální cena (${price} Kč).`,
      });
    }

    auction.price = amount;
    await auction.save();

    const bid = new Bid({
      amount,
      time: new Date(),
      name: user.username,
    });

    await bid.save();

    req.io.emit("new-bid", bid);
    req.io.emit("price-updated", amount);

    res.status(201).json(bid);
  };
  
  
 

  
export const getStartingPriceValue = () => price;
