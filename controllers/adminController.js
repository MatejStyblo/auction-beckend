import Auction from "../models/Auction.js";
import User from "../models/User.js";
import Bid from "../models/Bid.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
// Nastavení trvání aukce (volá superadmin)
export const setAuctionDuration = async (req, res) => {
  const io = req.io;
  try {
    const { endDate } = req.body;

    if (!endDate || isNaN(Date.parse(endDate))) {
      return res.status(400).json({ error: "Neplatné datum ukončení aukce." });
    }

    const end = new Date(endDate);
    const now = new Date();

    if (end <= now) {
      return res
        .status(400)
        .json({ error: "Datum ukončení aukce musí být v budoucnosti." });
    }

    const auction = await Auction.findOneAndUpdate(
      {},
      { endDate: end },
      { upsert: true, new: true }
    );

    io.emit("auction:current", auction); // Notifikace klientům
    res.json(auction);
  } catch (err) {
    res.status(500).json({
      message: "Chyba při nastavování aukce",
      error: err.message,
    });
  }
};

  

// REST endpoint pro získání aukce přes HTTP
export const getAuctionInfo = async (req, res) => {
  try {
    const auction = await Auction.findOne();
    if (!auction) {
      return res.status(404).json({ error: "Žádná aukce nebyla nalezena" });
    }
    res.json(auction);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Chyba při načítání aukce", details: err.message });
  }
};
export const register = async (req, res) => {
  const { username, password, role } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: "Uživatel existuje" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  await user.save();
  res.status(201).json(user);
};

export const adminCreateUser = async (req, res) => {
  const { username, password, role, userId } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  await user.save();
  res.status(201).json(user);
};
export const changePassword = async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashed });

  res.json({ message: "Heslo změněno" });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // vynecháme hashovaná hesla
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Uživatel smazán" });
  } catch (err) {
    res.status(500).json({ error: "Chyba při mazání uživatele" });
  }
  
}
export const setMinimumBid = async (req, res) => {
  const { minimumBid } = req.body;

  if (typeof minimumBid !== "number" || minimumBid <= 0) {
    return res
      .status(400)
      .json({ error: "Neplatná výše minimálního příhozu." });
  }

  const auction = await Auction.findOne();
  if (!auction) {
    return res.status(404).json({ error: "Aukce nenalezena." });
  }

  auction.minimumBid = minimumBid;
  await auction.save();

  res.json({ success: true, minimumBid });
};
export const deleteAllBids = async (req, res) => {
  try {
    await Bid.deleteMany({});
    req.io.emit("bids-cleared");
    res.json({ success: true, message: "Všechny příhozy byly smazány." });
  } catch (err) {
    res.status(500).json({ error: "Chyba při mazání příhozů." });
  }
};

export const deleteBidById = async (req, res) => {
  const { id } = req.params;

  try {
    const bid = await Bid.findByIdAndDelete(id);
    if (!bid) {
      return res.status(404).json({ error: "Příhoz nenalezen." });
    }

    req.io.emit("bid-deleted", id);
    res.json({ success: true, message: "Příhoz byl smazán.", id });
  } catch (err) {
    res.status(500).json({ error: "Chyba při mazání příhozu." });
  }
};
// Nahrání obrázku pro aukci


export const uploadAuctionImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Obrázek nebyl nahrán." });
    }

    // cesta k upload složce
    const uploadDir = path.join(process.cwd(), "uploads");

    // smažeme všechny soubory kromě právě nahraného
    const files = fs.readdirSync(uploadDir);
    for (const f of files) {
      if (f !== file.filename) {
        const filePath = path.join(uploadDir, f);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn("Nepodařilo se smazat soubor:", filePath, err);
        }
      }
    }

    // Uložíme URL obrázku do DB (pokud máš takovou logiku)
    const auction = await Auction.findOneAndUpdate(
      {},
      { image: `/uploads/${file.filename}` },
      { upsert: true, new: true }
    );

    req.io.emit("auction:image", auction.image);

    res.json({ message: "Obrázek byl uložen", image: auction.image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba při ukládání obrázku." });
  }
};


// Získání obrázku aukce
export const getAuctionImage = async (req, res) => {
  try {
    const auction = await Auction.findOne();
    if (!auction?.image) {
      return res.status(404).json({ error: "Obrázek aukce nenalezen." });
    }

    res.json({ image: auction.image });
  } catch (err) {
    res.status(500).json({ error: "Chyba při získávání obrázku." });
  }
};
export const deleteAuctionImage = async (req, res) => {
  try {
    const auction = await Auction.findOne();
    if (!auction?.image) {
      return res.status(404).json({ error: "Obrázek aukce nenalezen." });
    }

    // fyzické smazání ze souborového systému
    const filePath = path.join(process.cwd(), auction.image);
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Nepodařilo se smazat soubor:", err);
    });

    // vymazání URL z DB
    auction.image = undefined;
    await auction.save();

    // notifikace klientům
    req.io.emit("auction:image-deleted");

    res.json({ success: true, message: "Obrázek smazán." });
  } catch (err) {
    res.status(500).json({ error: "Chyba při mazání obrázku." });
  }
};