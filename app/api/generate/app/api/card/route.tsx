import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || 'Card Title';
  const body = searchParams.get('body') || 'Card body text';
  const color = searchParams.get('color') || '#D32F2F';
  const accent = searchParams.get('accent') || '#1E3A8A';
  const size = searchParams.get('size') === 'portrait' ? 'portrait' : 'square';
  const watermark = searchParams.get('watermark') !== '0';

  const width = 1080;
  const height = size === 'portrait' ? 1350 : 1080;

  const bodyLen = body.length;
  const baseBody = size === 'portrait' ? 44 : 40;
  const fontSizeBody =
    bodyLen > 600 ? baseBody - 8 : bodyLen > 400 ? baseBody - 4 : baseBody;

  const titleLen = title.length;
  const baseTitle = size === 'portrait' ? 72 : 64;
  const fontSizeTitle =
    titleLen > 48 ? baseTitle - 8 : titleLen > 32 ? baseTitle - 4 : baseTitle;

  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: 'flex',
          background: '#FFFFFF',
          color: '#0A0A0A',
          position: 'relative',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 16,
            background: color
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: size === 'portrait' ? '72px' : '64px',
            marginLeft: '32px',
            gap: size === 'portrait' ? 28 : 24
          }}
        >
          <div style={{ fontSize: fontSizeTitle, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: fontSizeBody, lineHeight: 1.32, whiteSpace: 'pre-wrap' }}>
            {body}
          </div>

          {watermark && (
            <div
              style={{
                marginTop: 'auto',
                fontSize: size === 'portrait' ? 24 : 22,
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{ width: 48, height: 2, background: accent, opacity: 0.7 }} />
              <div>Made with TrendCards • yourdomain.com</div>
            </div>
          )}
        </div>
      </div>
    ),
    { width, height }
  );
}
