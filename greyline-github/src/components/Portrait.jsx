import React from 'react';

const SKINS = [
  ['#c99470', '#9d684f', '#e0b18a'], ['#b77f5e', '#875840', '#d49b76'],
  ['#d5aa83', '#a67a5e', '#ebc39b'], ['#95684f', '#684937', '#b98564'],
  ['#c18a68', '#8d5c49', '#daa17d'], ['#aa765b', '#79503f', '#c99372'],
];
const HAIRS = ['#292724', '#41352d', '#5c4938', '#242b2a', '#704b35', '#80715c', '#3c3233'];
const COATS = ['#43534e', '#554d5e', '#405365', '#675043', '#3c4c41', '#5d5a48', '#4b4442'];
const SCARVES = ['#7d5147', '#756b45', '#3e6265', '#665170', '#7c633f'];

function features(seed) {
  const n = Math.abs(Number(seed) || 1);
  return {
    skin: SKINS[n % SKINS.length],
    hair: HAIRS[(n >> 2) % HAIRS.length],
    coat: COATS[(n >> 4) % COATS.length],
    scarf: SCARVES[(n >> 6) % SCARVES.length],
    hairStyle: (n >> 3) % 8,
    face: (n >> 5) % 3,
    eyes: (n >> 7) % 3,
    beard: (n >> 8) % 5 === 0,
    moustache: (n >> 9) % 4 === 0,
    glasses: (n >> 7) % 6 === 0,
    age: (n >> 8) % 4,
    scarfOn: (n >> 5) % 3 === 0,
    hat: (n >> 6) % 9 === 0,
    earring: (n >> 9) % 7 === 0,
  };
}

export default function Portrait({ seed, className = '', label = '入境者照片', sex }) {
  const f = features(seed);
  if (sex === '女') {
    f.beard = false;
    f.moustache = false;
    if ([0, 3, 7].includes(f.hairStyle)) f.hairStyle = f.hairStyle === 7 ? 5 : 2;
  }
  const [skin, shade, light] = f.skin;
  const facePath = [
    'M30 24h36v5h5v39h-5v10h-7v7H37v-7h-7V68h-5V29h5Z',
    'M27 27h42v4h4v39h-6v12H61v5H35v-5H29V70h-6V31h4Z',
    'M33 22h30v6h5v42h-5v11H58v6H38v-6H33V70h-5V28h5Z',
  ][f.face];
  return (
    <svg className={`portrait portrait-redesigned ${className}`} viewBox="0 0 96 112" role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width="96" height="112" fill="#27332f" />
      <rect width="96" height="3" fill="#617066" opacity=".35" />
      <path d="M0 83h96v29H0z" fill="#202a26" />
      <path d="M10 112v-17h5v-7h13v-5h40v5h13v7h5v17Z" fill={f.coat} />
      <path d="M10 112v-17h5v-7h13v-5h7v29ZM86 112v-17h-5v-7H68v-5h-7v29Z" fill="#17231f" opacity=".28" />
      <path d="M40 75h16v19H40z" fill={skin} />
      <path d="M40 75h16v7H40z" fill={shade} />
      <path d="M37 84h7v28H30l3-19ZM59 84h-7v28h14l-3-19Z" fill="#a0a48e" opacity=".22" />
      <path d="M47 87h3v25h-3z" fill="#1b2824" opacity=".65" />
      {f.scarfOn && <><path d="M31 85h34v8H31z" fill={f.scarf} /><path d="M52 91h10v21H52z" fill={f.scarf} /><path d="M54 94h2v15h-2zM59 94h1v15h-1z" fill="#d0c19a" opacity=".16" /></>}

      {/* Hair behind the face and ears. */}
      {(f.hairStyle === 2 || f.hairStyle === 6) && <path d="M25 23h46v55h-7V42H32v36h-7Z" fill={f.hair} />}
      {f.hairStyle === 5 && <path d="M30 17h36v8h7v14H23V25h7Z" fill={f.hair} />}
      <path d={facePath} fill={skin} />
      <path d="M30 55h5v15h-5zM61 55h5v15h-5z" fill={shade} opacity=".32" />
      <path d="M34 30h7v4h-7zM57 30h6v3h-6zM36 69h5v3h-5z" fill={light} opacity=".38" />
      <path d="M22 48h7v19h-4v5h-3Z" fill={skin} /><path d="M74 48h-7v19h4v5h3Z" fill={skin} />
      <path d="M23 53h3v9h-3zM70 53h3v9h-3z" fill={shade} />
      {f.earring && <path d="M69 65h3v5h-3z" fill="#b5a269" />}

      {/* Eight fine-pixel hairstyles. */}
      {f.hairStyle === 0 && <><path d="M28 25V17h5v-4h31v4h5v15h-7v-8H35v8h-7Z" fill={f.hair} /><path d="M30 17h34v4H30z" fill="#a18b68" opacity=".12" /></>}
      {f.hairStyle === 1 && <><path d="M27 30V19h5v-6h34v4h5v17h-9v-8H42v4H27Z" fill={f.hair} /><path d="M37 13h27v3H37z" fill="#c0aa84" opacity=".1" /></>}
      {f.hairStyle === 2 && <><path d="M25 32V20h5v-7h37v5h5v22h-6V28H34v12h-9Z" fill={f.hair} /><path d="M28 22h6v45h-6zM63 24h6v43h-6z" fill={f.hair} /></>}
      {f.hairStyle === 3 && <><path d="M31 27V18h6v-4h25v5h4v10h-6v-5H38v6h-7Z" fill={f.hair} /><path d="M39 14h4v11h-4zM48 14h3v8h-3z" fill="#a18b68" opacity=".15" /></>}
      {f.hairStyle === 4 && <><path d="M27 30V20h5v-7h33v4h6v20h-8v-9H53v4H37v7H27Z" fill={f.hair} /><path d="M30 17h8v4h-8zM57 15h7v4h-7z" fill="#b69b78" opacity=".12" /></>}
      {f.hairStyle === 5 && <><path d="M25 30V19h6v-7h35v5h6v19h-8v-8H33v11h-8Z" fill={f.hair} /><path d="M30 12h34v4H30z" fill="#c1ab8b" opacity=".12" /></>}
      {f.hairStyle === 6 && <><path d="M26 32V20h5v-8h35v5h5v23h-7V28H36v12h-10Z" fill={f.hair} /><path d="M28 34h5v38h-5zM64 32h5v40h-5z" fill={f.hair} /></>}
      {f.hairStyle === 7 && <><path d="M33 24v-7h5v-4h23v4h4v10h-6v-6H39v7h-6Z" fill={f.hair} /><path d="M40 13h3v7h-3zM55 13h3v7h-3z" fill="#b9a181" opacity=".12" /></>}
      {f.hat && <><path d="M23 24V12h7V7h36v5h7v12Z" fill="#3b4941" /><path d="M19 23h58v6H19z" fill="#26362f" /><path d="M32 12h32v4H32z" fill="#78806a" opacity=".4" /></>}

      {/* Brows, eyes and small highlights. */}
      <path d={f.eyes === 0 ? 'M33 43h11v3H33zM53 43h11v3H53z' : f.eyes === 1 ? 'M32 44h12v2H32zM53 42h12v3H53z' : 'M33 42h11v2H33zM53 44h11v2H53z'} fill={f.hair} />
      <path d="M34 49h10v4H34zM54 49h10v4H54z" fill="#ded7bd" />
      <path d={f.eyes === 2 ? 'M36 50h4v4h-4zM57 50h4v4h-4z' : 'M38 49h4v4h-4zM58 49h4v4h-4z'} fill="#27322e" />
      <path d="M39 49h1v1h-1zM59 49h1v1h-1z" fill="#eef1db" />
      <path d="M34 54h9v1H34zM54 54h9v1H54z" fill={shade} opacity=".65" />
      {f.glasses && <g fill="none" stroke="#2b3531" strokeWidth="2"><path d="M31 47h15v10H31zM51 47h15v10H51zM46 50h5M28 49h3M66 49h4" /></g>}

      {/* Nose, mouth, age and facial hair. */}
      <path d="M46 52h5v11h-3v4h-5v-3h3Z" fill={shade} opacity=".78" />
      <path d="M48 53h3v9h-3z" fill={light} opacity=".45" />
      <path d="M40 73h17v3H40z" fill="#734c42" />
      <path d="M43 76h11v2H43z" fill={light} opacity=".28" />
      {f.moustache && <path d="M39 68h8v3h8v-3h5v6H38v-4Z" fill={f.hair} />}
      {f.beard && <><path d="M31 72h6v8h7v5h10v-5h7v-8h6v10h-6v8H37v-8h-6Z" fill={f.hair} /><path d="M42 84h13v3H42z" fill="#a48766" opacity=".13" /></>}
      {f.age > 0 && <path d="M31 38h12v1H31zM54 38h11v1H54zM33 59h8v1H33zM56 59h8v1H56z" fill={shade} opacity=".55" />}
      {f.age > 1 && <path d="M35 40h7v1H35zM55 40h7v1H55zM30 62h5v1H30zM62 62h5v1H62z" fill={shade} opacity=".5" />}
      {f.age > 2 && <path d="M32 19h5v3h-5zM60 18h5v3h-5zM45 80h6v1h-6z" fill="#a9a18b" opacity=".55" />}

      {/* Film grain and tiny photographic border pixels. */}
      <path d="M5 15h2v2H5zM84 33h2v2h-2zM15 69h1v1h-1zM76 91h2v1h-2zM9 103h1v2H9zM88 75h1v1h-1z" fill="#d9dfc9" opacity=".12" />
      <path d="M0 0h96v112H0Z" fill="none" stroke="#a2b09c" strokeOpacity=".18" strokeWidth="2" />
    </svg>
  );
}
