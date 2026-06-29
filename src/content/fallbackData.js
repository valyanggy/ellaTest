function colorFillImageUrl(index, seed = 0) {
  const hue = (index * 47 + seed * 23 + 18) % 360;
  const background = `hsl(${hue} 86% 58%)`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500">
      <rect width="1200" height="1500" fill="${background}"/>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

export const fallbackProjects = [
  {
    _id: "fallback-makeup-hair",
    title: "Makeup Hair",
    year: "2024",
    filterItem: "Makeup Hair",
    clusterShape: "bow",
    clusterColor: "#0c8be5",
    counterNodeColor: "#005f9e",
    normalNodeColor: "#0c8be5",
    ghostNodeColor: "#9bd8ff",
    medium: "Makeup, hair, photography",
    credits: "Test filler content",
    tags: ["Makeup Hair"],
    images: Array.from({ length: 14 }, (_, index) => ({
      title: `Color ${String(index + 1).padStart(2, "0")}`,
      imageUrl: colorFillImageUrl(index)
    }))
  },
  {
    _id: "fallback-nailed-jpeg",
    title: "Nailed.jpeg",
    year: "2024",
    filterItem: "Nailed.jpeg",
    clusterShape: "bow",
    clusterColor: "#ff4fb8",
    counterNodeColor: "#e50c89",
    normalNodeColor: "#ff4fb8",
    ghostNodeColor: "#ffc1e4",
    medium: "Nail art, image archive",
    credits: "Test filler content",
    tags: ["Nailed.jpeg"],
    images: Array.from({ length: 32 }, (_, index) => ({
      title: `Nailed ${String(index + 1).padStart(2, "0")}`,
      imageUrl: colorFillImageUrl(index, 8)
    }))
  },
  {
    _id: "fallback-bowl",
    title: "Bowl",
    year: "2024",
    filterItem: "Random",
    clusterShape: "flower",
    clusterColor: "#e5800c",
    counterNodeColor: "#000000",
    normalNodeColor: "#e5800c",
    ghostNodeColor: "#ffd19b",
    medium: "Photography",
    tags: ["Food"],
    images: [
      { title: "Grain", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/9b71e45c86bdf7d60ee29c419ec42b299f1d475a-1282x1268.png" },
      { title: "Mar", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/81c81cb0163da53e522cca6f4ac56b47159b5417-1282x1271.png" },
      { title: "Lay", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/ef14c3a33c285f846d5a17e545ef5c4ebfe53c0f-1282x1266.png" },
      { title: "Presentation", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/006f49a1d1e3f1a79d148eb5de0d00d4c55a99f5-3024x4032.png" }
    ]
  },
  {
    _id: "fallback-beach",
    title: "Beach",
    year: "2024",
    filterItem: "Random",
    clusterShape: "worm",
    clusterColor: "#0ce5d7",
    counterNodeColor: "#2a441f",
    normalNodeColor: "#0ce5d7",
    ghostNodeColor: "#9bf7ef",
    medium: "Photography",
    tags: ["Photography"],
    images: [
      { title: "Erosion", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/9244b94cf642c6d28a5832f3984a76b0adf8285c-1280x1920.jpg" },
      { title: "Tower", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/9cd7c233d6588d9c19f8c6d03eaba5b973dfc2fd-1280x1920.jpg" },
      { title: "Wave", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/65e8b758329e6ed9819ac2e5bd1ef6fa9e88964b-1280x1920.jpg" },
      { title: "Birds", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/e1513394c6fd57cfdef247b65f8ed69e9e98bffa-1280x1920.jpg" },
      { title: "Tree", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/205b421fc872ed4ae8547d65c599614989131518-1280x1920.jpg" },
      { title: "Distant", imageUrl: "https://cdn.sanity.io/images/hsvfeudq/ella-burgess/ba6cb3bba2bfaf3f8574ca743c1d9b665638940b-1280x1920.jpg" }
    ]
  },
  {
    _id: "fallback-cakes",
    title: "Cakes",
    year: "2021",
    filterItem: "Cakes",
    clusterShape: "bow",
    clusterColor: "#e5d70c",
    counterNodeColor: "#e50c0c",
    normalNodeColor: "#e5d70c",
    ghostNodeColor: "#f3ec87",
    medium: "Flour, wheat, eggs, sugar",
    tags: ["Food", "Photography"],
    images: [
      { title: "Cake 01", imageUrl: "/img/IMG_7182 copy.jpg" },
      { title: "Cake 02", imageUrl: "/img/0FE977DF-B77D-42DE-AE0B-8BD1672B7345_Original.jpg" },
      { title: "Cake 03", imageUrl: "/img/IMG_0516.jpg" },
      { title: "Cake 04", imageUrl: "/img/IMG_1314.jpg" },
      { title: "Cake 05", imageUrl: "/img/IMG_2142_Original.jpg" },
      { title: "Cake 06", imageUrl: "/img/IMG_3275_Original copy.jpg" }
    ]
  }
];
