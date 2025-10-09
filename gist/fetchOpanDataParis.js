// ----------------------------------------------------
// A function to fetch data from opendata.paris.fr api
// By, Nicolas Lambert, 2025
// ------------------------------------------------------

async function fetchOpanDataParis(dataset, geojson = true, coords = undefined) {
  let all = [];
  let offset = 0;
  const limit = 100;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const url = `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/${dataset}/records?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);
    const data = await response.json();
    all.push(...data.results);
    totalCount = data.total_count || all.length; // total_count est fourni par l'API
    offset += limit;
  }

  // Field with coordinates
  if (!coords) {
    coords = ["geo_point_2d", "coordonnees_geo"].filter((x) =>
      Object.keys(all[0]).includes(x)
    )[0];
  }

  // Filter
  all = all
    .filter((d) => d[coords]?.lat !== undefined)
    .filter((d) => d[coords]?.lon !== undefined);

  // To geoJSON
  if (geojson) {
    return {
      type: "FeatureCollection",
      features: all.map((d) => ({
        type: "Feature",
        properties: d,
        geometry: {
          type: "Point",
          coordinates: [d[coords].lon, d[coords].lat],
        },
      })),
    };
  } else {
    return all;
  }
}
