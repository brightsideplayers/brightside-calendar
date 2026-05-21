import { db } from "../firebaseAdmin";

export default async function handler(
  req,
  res
) {
  const snapshot =
    await db
      .collection("posts")
      .get();

  const posts = snapshot.docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data()
    })
  );

  console.log(posts);

  return res.status(200).json({
    success: true,
    posts
  });
}
