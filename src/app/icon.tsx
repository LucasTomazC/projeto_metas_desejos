import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 96,
          background: 'linear-gradient(135deg, #FF6B4A 0%, #FFA07A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 48,
          boxShadow: '0 8px 32px rgba(255, 107, 74, 0.4)',
        }}
      >
        ✨
      </div>
    ),
    {
      ...size,
    }
  );
}

