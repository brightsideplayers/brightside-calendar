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
for (const post of posts) {
  const createMediaRes =
    await fetch(
      `https://graph.facebook.com/v23.0/${process.env.INSTAGRAM_USER_ID}/media`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          image_url:
            post.imageUrl,

          caption:
            post.caption,

          access_token:
            process.env
              .INSTAGRAM_ACCESS_TOKEN
        })
      }
    );

  const mediaData =
    await createMediaRes.json();

  console.log(mediaData);
}
  console.log(posts);

  return res.status(200).json({
    success: true,
    posts
  });
}
