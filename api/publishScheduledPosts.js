import { db } from "./firebaseAdmin.js";

export default async function handler(
  req,
  res
) {
  try {
    const snapshot =
      await db
        .collection("posts")
        .get();

    const posts =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

    return res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
