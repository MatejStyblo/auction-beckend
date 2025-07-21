import User from "../models/User.js";
import bcrypt from "bcrypt";

const createSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ username: "superadmin" });
    if (existing) {
      console.log("Superadmin už existuje.");
      return;
    }

    const hashedPassword = await bcrypt.hash("superadmin", 10);

    const superadmin = new User({
      username: "superadmin",
      password: hashedPassword,
      role: "superadmin",
    });

    await superadmin.save();
    console.log("Superadmin vytvořen.");
  } catch (err) {
    console.error("Chyba při vytváření superadmina:", err);
  }
};

export default createSuperAdmin;
