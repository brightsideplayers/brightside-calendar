import { db } from "./firebaseAdmin.js";

export default async function handler(req, res) {
  try {
    const now = new Date();

    const snapshot = await db
      .collection("posts")
      .where("status", "==", "scheduled")
      .get();
console.log("SCHEDULED POSTS FOUND:", snapshot.size);
    const posts = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((post) => new Date(post.scheduledFor) <= now);
console.log("DUE POSTS FOUND:", posts.length);

posts.forEach((post) => {
  console.log(
    "DUE POST:",
    post.id,
    "platform:", post.platform,
    "scheduledFor:", post.scheduledFor,
    "now:", now.toISOString()
  );
});
    const results = [];

    for (const post of posts) {
      const postRef = db.collection("posts").doc(post.id);

      if (
        post.platform !== "Facebook" &&
        post.platform !== "Instagram"
      ) {
        results.push({
          postId: post.id,
          skipped: true,
          reason: `Autopost not supported for ${post.platform}`
        });

        continue;
      }

      if (!post.imageUrl) {
        results.push({
          postId: post.id,
          error: "Missing imageUrl"
        });

        continue;
      }

      if (post.platform === "Facebook") {
        const facebookRes = await fetch(
          `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              url: post.imageUrl,
              caption: post.caption || "",
              access_token: process.env.INSTAGRAM_ACCESS_TOKEN
            })
          }
        );

        const facebookData = await facebookRes.json();

        if (!facebookRes.ok || facebookData.error) {
          results.push({
            postId: post.id,
            platform: "Facebook",
            success: false,
            facebookData
          });

          continue;
        }

        await postRef.update({
          status: "published",
          publishedAt: new Date().toISOString(),
          facebookPostId: facebookData.post_id || facebookData.id || ""
        });

        results.push({
          postId: post.id,
          platform: "Facebook",
          success: true,
          facebookData
        });

        continue;
      }

      if (post.platform === "Instagram") {
        const createMediaRes = await fetch(
          `https://graph.facebook.com/v23.0/${process.env.INSTAGRAM_USER_ID}/media`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              image_url: post.imageUrl,
              caption: post.caption || "",
              access_token: process.env.INSTAGRAM_ACCESS_TOKEN
            })
          }
        );

        const mediaData = await createMediaRes.json();
console.log("INSTAGRAM CREATE MEDIA RESPONSE:", JSON.stringify(mediaData));
        if (!createMediaRes.ok || mediaData.error || !mediaData.id) {
          results.push({
            postId: post.id,
            platform: "Instagram",
            success: false,
            mediaData
          });

          continue;
        }
await new Promise((resolve) =>
  setTimeout(resolve, 8000)
);
        const publishRes = await fetch(
          `https://graph.facebook.com/v23.0/${process.env.INSTAGRAM_USER_ID}/media_publish`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              creation_id: mediaData.id,
              access_token: process.env.INSTAGRAM_ACCESS_TOKEN
            })
          }
        );

        const publishData = await publishRes.json();

        if (!publishRes.ok || publishData.error) {
          results.push({
            postId: post.id,
            platform: "Instagram",
            success: false,
            mediaData,
            publishData
          });

          continue;
        }

        await postRef.update({
          status: "published",
          publishedAt: new Date().toISOString(),
          instagramMediaId: publishData.id || ""
        });

        results.push({
          postId: post.id,
          platform: "Instagram",
          success: true,
          mediaData,
          publishData
        });
      }
    }

    return res.status(200).json({
      success: true,
      checkedAt: now.toISOString(),
      results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
