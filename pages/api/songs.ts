import clientPromise from "../../lib/mongodb";

export default async function songs(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");

    const songs = await db
      .collection("songs")
      .find({})
      .sort({ bid: -1 })
      .limit(10)
      .toArray();

    res.json(songs);
  } catch (e) {
    console.error(e);
  }
};
