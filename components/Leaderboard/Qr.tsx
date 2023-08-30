import { QRCodeSVG } from 'qrcode.react';
export const QR = ({ shortName }: { shortName: string }) => {
  return (
    <div className="drop-shadow-2xl m-auto">
      {shortName && (
        <QRCodeSVG
          value={`https://pleb.fm/${shortName}`}
          width={'150px'}
          height={'150px'}
          includeMargin={true}
          level={'H'}
          imageSettings={{
            src: '/pleb-fm-favicon.svg',
            height: 50,
            width: 50,
            excavate: false,
          }}
        />
      )}
    </div>
  );
};
