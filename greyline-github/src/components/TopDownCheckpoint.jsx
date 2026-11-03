import React from 'react';

const QUEUE_SPOTS = [
  [28, 163], [45, 157], [61, 148], [78, 143], [93, 132], [109, 126],
  [124, 115], [141, 110], [156, 99], [172, 94], [188, 84], [202, 80],
];
const COATS = ['#48564e', '#635247', '#4b5865', '#635b6e', '#6a6048', '#3f514b'];

function Traveler({ x = 0, y = 0, seed = 0, bag = true, guard = false }) {
  const coat = guard ? '#556448' : COATS[seed % COATS.length];
  const skin = ['#c08d69', '#d0a17a', '#a9785b', '#ba8665'][seed % 4];
  return <g transform={`translate(${x} ${y})`} className="map-traveler-sprite">
    <path d="M-5 7h12v4H-5z" fill="#101814" opacity=".35" />
    <path d="M-3 3h3v7h-3zM2 3h3v7H2z" fill="#252b28" />
    <path d="M-5-6h11v11H-5z" fill={coat} />
    <path d="M-5-6h3v11h-3z" fill="#a3ad91" opacity=".13" />
    <path d="M-3-12h7v7h-7z" fill={skin} />
    <path d="M-3-12h7v3h-7z" fill={guard ? '#394536' : '#342e29'} />
    {guard && <path d="M-5-13h11v3H-5zM-1-15h4v2h-4z" fill="#46543f" />}
    {bag && !guard && <><path d="M6-2h5v7H6z" fill="#63503c" /><path d="M7-4h3v2H7z" fill="none" stroke="#63503c" /></>}
    <path d="M-6-4h1v6h-1zM6-4h1v6H6z" fill={skin} />
  </g>;
}

export default function TopDownCheckpoint({ current, currentIndex, queueLength, weather, resolution }) {
  const remaining = Math.max(0, queueLength - currentIndex - 1);
  const isSnow = weather.includes('雪');
  const isRain = weather.includes('雨');
  const isFog = weather.includes('霧');
  return <div className={`topdown-checkpoint ${isFog ? 'foggy' : ''}`}>
    <svg viewBox="0 0 320 190" role="img" aria-label="上帝視角的灰港第七檢查站與排隊人潮" shapeRendering="crispEdges">
      <defs>
        <pattern id="fence" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0 8 8M8 0 0 8" stroke="#71806e" strokeWidth=".7" opacity=".42" /></pattern>
        <pattern id="roof" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 1h7" stroke="#a1a28c" strokeWidth=".6" opacity=".13" /></pattern>
        <pattern id="road" width="23" height="17" patternUnits="userSpaceOnUse"><path d="M2 3h4v1H2zM17 11h3v1h-3z" fill="#a7aa96" opacity=".08" /></pattern>
      </defs>
      <rect width="320" height="190" fill="#202923" />
      <path d="M0 0h320v52H0z" fill="#343e34" />
      <path d="M0 52h320v138H0z" fill="#3c4037" />
      <path d="M0 52h320v138H0z" fill="url(#road)" />
      <path d="M0 69 320 38v15L0 84Z" fill="#202a24" />
      <path d="M0 69 320 38v6L0 76Z" fill="url(#fence)" />
      {Array.from({ length: 15 }).map((_, i) => <path key={i} d={`M${i * 24 - 4} 67h3v20h-3z`} fill="#151e19" transform={`rotate(-5 ${i * 24} 70)`} />)}
      <path d="M0 176 217 66l24 8L24 190H0Z" fill="#494a40" />
      <path d="M0 176 217 66l3 1L4 181Z" fill="#777767" opacity=".42" />
      <path d="M15 165 202 73" stroke="#b4ac80" strokeWidth="2" strokeDasharray="15 12" opacity=".42" />
      <path d="M6 185 219 73" stroke="#191f1b" strokeWidth="2" opacity=".5" />

      {/* Main building, roof seams, vents and lit windows. */}
      <path d="M202 15h97v69h-97z" fill="#161e1a" opacity=".45" transform="translate(5 6)" />
      <path d="M202 15h97v69h-97z" fill="#5a6053" />
      <path d="M202 15h97v69h-97z" fill="url(#roof)" />
      <path d="M207 20h87v59h-87z" fill="#444d43" />
      <path d="M211 24h79v51h-79z" fill="#525a4d" />
      <path d="M202 15h97v5h-97zM202 79h97v5h-97z" fill="#7c8070" opacity=".45" />
      <path d="M221 29h20v15h-20zM254 25h18v12h-18z" fill="#323c34" />
      <path d="M223 31h16v11h-16zM256 27h14v8h-14z" fill="#717667" opacity=".35" />
      <path d="M210 65h15v10h-15zM239 61h15v14h-15zM271 60h15v15h-15z" fill="#212c26" />
      <path d="M212 67h11v6h-11zM241 64h11v8h-11zM273 63h11v9h-11z" fill="#b39c61" opacity=".75" />
      <path d="M230 84h31v13h-31z" fill="#252f28" />
      <path d="M235 84h21v5h-21z" fill="#b69b60" opacity=".65" />

      {/* Inspection island and barrier. */}
      <path d="M206 101h69v28h-69z" fill="#252d27" />
      <path d="M211 104h59v19h-59z" fill="#64695b" />
      <path d="M215 107h51v11h-51z" fill="#3d473d" />
      <path d="M230 106h15v15h-15z" fill="#b69b60" opacity=".55" />
      <path d="M188 91h5v34h-5z" fill="#1c251f" />
      <path d="M174 91h53v5h-53z" fill="#b2ab91" />
      <path d="M178 91h9v5h-9zM197 91h9v5h-9zM216 91h8v5h-8z" fill="#8c4e43" />
      <path d="M183 127h17v4h-17z" fill="#202721" />
      <Traveler x={251} y={111} seed={4} guard bag={false} />
      <Traveler x={282} y={91} seed={2} guard bag={false} />

      {/* Watchtower and tiny detail props. */}
      <path d="M151 15h31v31h-31z" fill="#1b231e" opacity=".4" transform="translate(3 4)" />
      <path d="M151 15h31v31h-31z" fill="#4b5649" />
      <path d="M155 19h23v19h-23z" fill="#28352c" />
      <path d="M158 21h7v7h-7zM169 21h6v7h-6z" fill="#b69b60" opacity=".55" />
      <path d="M157 46h4v24h-4zM173 46h4v20h-4z" fill="#222d25" />
      <path d="M15 24h49v28H15z" fill="#2a352c" /><path d="M19 28h41v20H19z" fill="#475344" />
      <path d="M22 31h15v10H22zM43 31h14v10H43z" fill="#28352d" />
      <path d="M78 28h3v29h-3z" fill="#202b23" /><path d="M74 27h11v4H74z" fill="#9b946b" opacity=".65" />
      <path d="M103 44h15v10h-15zM108 38h6v6h-6z" fill="#2d382f" />
      <path d="M15 97h19v11H15zM18 93h13v4H18z" fill="#4c5546" />
      <path d="M15 97h19v3H15z" fill="#737765" opacity=".4" />

      {/* Queue, including individualized bags and clothing. */}
      {Array.from({ length: Math.min(remaining, 12) }).map((_, i) => {
        const [x, y] = QUEUE_SPOTS[i];
        return <g key={`${current.id}-queue-${i}`} className="map-queuer" style={{ animationDelay: `${i * -.35}s` }}><Traveler x={x} y={y} seed={current.appearanceId + i + 1} bag={i % 3 !== 1} /></g>;
      })}
      <g key={`${current.id}-${resolution ? 'leave' : 'enter'}`} className="map-current-traveler">
        <Traveler seed={current.appearanceId} />
        <animateMotion
          dur={resolution ? '0.85s' : '1.05s'}
          fill="freeze"
          path={resolution ? 'M228 80 L253 104 L292 139' : 'M187 84 L207 81 L228 80'}
        />
      </g>

      {/* Border direction signs without readable text. */}
      <path d="M129 67h29v13h-29z" fill="#28342b" /><path d="M133 71h21v2h-21zM133 75h14v2h-14z" fill="#a8ad94" opacity=".5" />
      <path d="M292 149h18v27h-18z" fill="#303b31" /><path d="M295 153h12v3h-12zM295 159h12v3h-12zM295 165h8v3h-8z" fill="#90967d" opacity=".4" />
      {isRain && <g className="map-rain" stroke="#b7c5b3" strokeWidth="1" opacity=".22">{Array.from({ length: 24 }).map((_, i) => <path key={i} d={`M${(i * 41) % 330} ${(i * 29) % 190}l-5 12`} />)}</g>}
      {isSnow && <g className="map-snow" fill="#d4dacb" opacity=".55">{Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M${(i * 47) % 320} ${(i * 31) % 190}h2v2h-2z`} />)}</g>}
      {isFog && <rect width="320" height="190" fill="#a7b09e" opacity=".1" />}
    </svg>
    <div className="map-legend"><span><i className="map-live-dot" /> 即時監視</span><b>CAM 07-A</b></div>
  </div>;
}
