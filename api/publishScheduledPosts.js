export default async function handler(
  req,
  res
) {
  console.log(
    "Cron job triggered"
  );

  return res.status(200).json({
    success: true,
    message:
      "Scheduled publisher running"
  });
}
