import { QRCodeSVG } from 'qrcode.react';
export const QR = ({ shortName }: { shortName: string }) => {
  return (
    <div className="drop-shadow-2xl m-auto rounded-xl overflow-hidden">
      {shortName && (
        <QRCodeSVG
          value={`https://pleb.fm/${shortName}`}
          bgColor={'#ffffff00'}
          fgColor={'#ffffff'}
          width={'120px'}
          height={'120px'}
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
