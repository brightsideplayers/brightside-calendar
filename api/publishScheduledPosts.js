import { db } from "../firebaseAdmin";

export default async function handler(
  req,
  res
) {
  const now = new Date();

  const snapshot =
    await db
      .collection("posts")
      .where(
        "status",
        "==",
        "scheduled"
      )
      .get();

  const posts = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter(
      (post) =>
        new Date(
          post.scheduledFor
        ) <= now
    );

  return res.status(200).json({
    success: true,
    now,
    posts
  });
}
