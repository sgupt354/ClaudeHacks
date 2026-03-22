import { insforge } from "../../lib/supabase";

async function geocodeLocation(location) {
  try {
    const query = encodeURIComponent(`${location}, Tempe, Arizona`);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=US`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return { lat: null, lng: null };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (id) {
      const { data, error } = await insforge.database
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return res.status(500).json({ error: error.message });

      // Update if housing
      if (data.issue_type === "housing") {
        const types = [
          "traffic",
          "street_lighting",
          "road_maintenance",
          "parks_facilities",
          "noise_complaint",
          "utilities",
          "other",
        ];
        const randomType = types[Math.floor(Math.random() * types.length)];
        await insforge.database
          .from("posts")
          .update({ issue_type: randomType })
          .eq("id", data.id);
        data.issue_type = randomType;
      }

      return res.status(200).json(data);
    }

    const { issue_type: filterType } = req.query;

    let query = insforge.database
      .from("posts")
      .select("*")
      .order("echo_count", { ascending: false });

    if (filterType) query = query.eq("issue_type", filterType);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Update housing posts to varied types
    const types = [
      "traffic",
      "street_lighting",
      "road_maintenance",
      "parks_facilities",
      "noise_complaint",
      "utilities",
      "other",
    ];
    for (const post of data) {
      if (post.issue_type === "housing") {
        const randomType = types[Math.floor(Math.random() * types.length)];
        await insforge.database
          .from("posts")
          .update({ issue_type: randomType })
          .eq("id", post.id);
        post.issue_type = randomType; // update in response
      }
    }

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const {
      complaint,
      formal_request,
      department,
      official_name,
      official_email,
      issue_type,
      location,
      video_url,
    } = req.body;

    // Geocode the location to get real coordinates
    const { lat, lng } = await geocodeLocation(location || "Tempe, Arizona");

    const { data, error } = await insforge.database
      .from("posts")
      .insert([
        {
          complaint,
          formal_request,
          department,
          official_name,
          official_email,
          issue_type,
          location,
          lat,
          lng,
          echo_count: 1,
          status: "pending",
          video_url: video_url || null,
        },
      ])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).end();
}
