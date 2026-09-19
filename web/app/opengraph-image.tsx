import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Vibio — Nature\'s Finest, Crafted for You';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1C1C1C',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#C9A96E', fontSize: 80, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 20 }}>
          VIBIO
        </div>
        <div style={{ color: '#FAF7F2', fontSize: 32, opacity: 0.8 }}>
          Nature&s Finest, Crafted for You
        </div>
      </div>
    ),
    { ...size },
  );
}
