import { db } from "./firebaseAdmin.js";

export default async function handler(
  req,
  res
) {
  try {
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

    const results = [];

    for (const post of posts) {
      if (!post.imageUrl) {
        results.push({
          id: post.id,
          error:
            "Missing imageUrl"
        });

        continue;
      }

      // FACEBOOK
      if (post.platform === "Facebook") {
        const facebookRes =
          await fetch(
            `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                url: post.imageUrl,

                caption:
                  post.caption,

                access_token:
                  process.env
                    .INSTAGRAM_ACCESS_TOKEN
              })
            }
          );

        const facebookData =
          await facebookRes.json();

        results.push({
          postId: post.id,
          facebookData
        });

        continue;
      }

      // INSTAGRAM
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

      if (mediaData.id) {
        const publishRes =
          await fetch(
            `https://graph.facebook.com/v23.0/${process.env.INSTAGRAM_USER_ID}/media_publish`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                creation_id:
                  mediaData.id,

                access_token:
                  process.env
                    .INSTAGRAM_ACCESS_TOKEN
              })
            }
          );

        const publishData =
          await publishRes.json();

        results.push({
          postId: post.id,
          mediaData,
          publishData
        });
      } else {
        results.push({
          postId: post.id,
          mediaData
        });
      }
    }

    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
