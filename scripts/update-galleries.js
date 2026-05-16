const fs = require('fs');

const blobRoot = 'https://oeslp2btyvzh1svt.public.blob.vercel-storage.com/products/';
const galleryRoot = blobRoot + 'gallery/';
const g = (f) => galleryRoot + f;
const r = (f) => blobRoot + f;

const newGalleries = {
  kito:      [r('kito_standard_soil_plant.jpg'),r('kito_standard_pot_only.jpg'),g('kito_large_soil_plant.jpg'),g('kito_large_soil_plant_2.jpg'),g('kito_large_snake-plant_environment.jpg'),g('kito_large_peace-lily_environment_1.jpg'),g('kito_large_snake-plant_living-room_environment.jpg'),r('kito-in-interior-space.jpg'),r('kito-lifestyle-interior.jpg')],
  ayo:       [r('ayo_standard_soil_plant.jpg'),r('ayo_standard_pot_only.jpg'),g('ayo_medium_soil_plant.jpg'),g('ayo_medium_soil_plant_2.jpg'),g('ayo_small_snake-plant_environment.jpg'),g('ayo_small_zz-plant_environment_2.jpg'),g('ayo_small_peace-lily_environment_1.jpg'),r('ayo-in-interior-space.jpg'),r('ayo-lifestyle-interior.jpg')],
  zola:      [r('zola_standard_soil_plant.jpg'),r('zola_standard_pot_only.jpg'),r('zola_standard_soil_plant_2.jpg'),g('zola_medium_soil_plant.jpg'),g('zola_medium_soil_plant_2.jpg'),g('zola_small_zz-plant_environment.jpg'),g('zola_small_snake-plant_environment_1.jpg'),g('zola_small_aloe-vera_environment_2.jpg'),r('zola-in-interior-space.jpg'),r('zola-lifestyle-interior.jpg')],
  safi:      [r('safi_standard_soil_plant.jpg'),r('safi_standard_pot_only.jpg'),r('safi_standard_soil_plant_2.jpg'),g('safi_medium_soil_plant.jpg'),g('safi_medium_soil_plant_2.jpg'),g('safi_medium_peace-lily_environment.jpg'),g('safi_medium_snake-plant_environment_1.jpg'),g('safi_medium_peace-lily_environment_2.jpg'),r('safi-in-interior-space.jpg'),r('safi-lifestyle-interior.jpg')],
  'tulo-noir':  [r('tulo-noir_standard_soil_plant.jpg'),r('tulo-noir_standard_pot_only.jpg'),r('tulo-noir_standard_soil_plant_2.jpg'),g('tulo-noir_medium_soil_plant.jpg'),g('tulo-noir_medium_soil_plant_2.jpg'),g('tulo-noir_large_zz-plant_environment.jpg'),g('tulo-noir_large_snake-plant_environment_1.jpg'),g('tulo-noir_large_zz-plant_environment_2.jpg'),r('tulo-noir-in-interior-space.jpg'),r('tulo-noir-lifestyle-interior.jpg')],
  'tulo-terra': [r('tulo-terra_standard_soil_plant.jpg'),r('tulo-terra_standard_pot_only.jpg'),g('tulo-terra_medium_soil_plant.jpg'),g('tulo-terra_small_soil_plant.jpg'),g('tulo-terra_small_zz-plant_environment.jpg'),g('tulo-terra_small_zz-plant_environment_1.jpg'),g('tulo-terra_small_zz-plant_environment_3.jpg'),r('tulo-terra-in-interior-space.jpg'),r('tulo-terra-lifestyle-interior.jpg')],
  'tulo-one':   [r('tulo-one_standard_soil_plant.jpg'),r('tulo-one_standard_pot_only.jpg'),r('tulo-one_standard_soil_plant_2.jpg'),g('tulo-one_medium_soil_plant.jpg'),g('tulo-one_medium_soil_plant_2.jpg'),g('tulo-one_medium_zz-plant_environment.jpg'),g('tulo-one_medium_snake-plant_environment_1.jpg'),g('tulo-one_medium_peace-lily_environment_2.jpg'),r('tulo-one-in-interior-space.jpg'),r('tulo-one-lifestyle-interior.jpg')],
  nuru:      [r('nuru_standard_soil_plant.jpg'),r('nuru_standard_pot_only.jpg'),r('nuru_standard_soil_plant_2.jpg'),g('nuru_medium_soil_plant.jpg'),g('nuru_medium_soil_plant_2.jpg'),g('nuru_small_snake-plant_environment.jpg'),g('nuru_small_zz-plant_environment_2.jpg'),g('nuru_small_snake-plant_living-room_environment.jpg'),r('nuru-in-interior-space.jpg'),r('nuru-lifestyle-interior.jpg')],
  kora:      [r('kora_standard_soil_plant.jpg'),r('kora_standard_pot_only.jpg'),r('kora_standard_soil_plant_2.jpg'),g('kora_medium_soil_plant.jpg'),g('kora_medium_soil_plant_2.jpg'),g('kora_medium_zz-plant_environment.jpg'),g('kora_medium_peace-lily_environment_1.jpg'),g('kora_small_peace-lily_stool_environment.jpg'),r('kora-in-interior-space.jpg'),r('kora-lifestyle-interior.jpg')],
  zuma:      [r('zuma_standard_soil_plant.jpg'),r('zuma_standard_pot_only.jpg'),r('zuma_standard_soil_plant_2.jpg'),g('zuma_medium_soil_plant.jpg'),g('zuma_medium_soil_plant_2.jpg'),g('zuma_medium_zz-plant_environment.jpg'),g('zuma_medium_pothos_environment_1.jpg'),g('zuma_medium_zz-plant_environment_2.jpg'),r('zuma-in-interior-space.jpg'),r('zuma-lifestyle-interior.jpg')],
};

function fmtGallery(arr) {
  return "gallery:['" + arr.join("','") + "']";
}

let src = fs.readFileSync('C:/Users/Muti/Desktop/tulo_final/lib/products.ts', 'utf8');
let patches = 0;

// Build old gallery string for each pot and replace
const pots = [
  { id: 'kito',      imgs4: false },
  { id: 'ayo',       imgs4: false },
  { id: 'zola',      imgs5: true  },
  { id: 'safi',      imgs5: true  },
  { id: 'tulo-noir', imgs5: true  },
  { id: 'tulo-terra',imgs4: false },
  { id: 'tulo-one',  imgs5: true  },
  { id: 'nuru',      imgs5: true  },
  { id: 'kora',      imgs5: true  },
  { id: 'zuma',      imgs5: true  },
];

for (const { id } of pots) {
  const newGalleryStr = fmtGallery(newGalleries[id]);

  // Find and replace the existing gallery array for this pot
  // Pattern: gallery:[... ending with lifestyle-interior.jpg for this pot-id ...]
  const escapedId = id.replace(/-/g, '\\-');
  const re = new RegExp(
    "gallery:\\[[^\\]]*?" + escapedId + "[^\\]]*?\\]",
    'g'
  );
  const before = src;
  src = src.replace(re, newGalleryStr);
  if (src !== before) {
    patches++;
    console.log('Patched: ' + id + ' (' + newGalleries[id].length + ' images)');
  } else {
    console.log('NO MATCH: ' + id);
  }
}

if (patches === 10) {
  fs.writeFileSync('C:/Users/Muti/Desktop/tulo_final/lib/products.ts', src);
  console.log('\nAll 10 galleries updated and saved ✓');
} else {
  console.log('\nOnly ' + patches + '/10 matched — NOT saving.');
}
