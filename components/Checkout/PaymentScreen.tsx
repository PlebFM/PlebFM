import { QRCodeSVG } from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CartIcon, CopyIcon } from '@bitcoin-design/bitcoin-icons-react/filled';
import bokeh2 from '../../public/pfm-bokeh-2.jpg';
import { MusicalNoteIcon, QueueListIcon } from '@heroicons/react/24/outline';
import Button from '../Utils/Button';
import NavBar from '../Utils/NavBar';
import { Song } from '../../models/Song';
import { usePathname } from 'next/navigation';
import { Spinner } from '../Utils/LoadingSpinner';
import { CheckoutHeader } from './CheckoutHeader';
import { usePayment } from '../hooks/usePayment';

type Props = {
  song: Song;
  readyToCheckout: boolean;
  invoicePaid: boolean;
  onPaid: () => void;
  totalBid: number;
};

function PaymentScreen({
  song,
  readyToCheckout,
  invoicePaid,
  onPaid,
  totalBid,
}: Props) {
  const pathname = usePathname();

  const { loading, bolt11 } = usePayment(song, totalBid, onPaid);

  return (
    <>
      <div className="fixed w-full h-full bg-black top-0 left-0 bg-pfm-purple-100">
        <img
          src={song?.album?.images[0]?.url ?? bokeh2}
          alt={song?.album?.name ?? 'Album'}
          width={100}
          height={100}
          className="object-cover w-full h-full blur-2xl opacity-50"
        />
      </div>

      <div className="relative mx-auto inset-x-0 max-w-xl px-12 pt-12 pb-36 text-white z-50 flex flex-col space-y-8 items-center min-h-screen font-thin">
        <CheckoutHeader song={song} />
        {loading ? (
          <div className="w-full h-full flex justify-center items-center pt-20">
            <Spinner />
          </div>
        ) : (
          <>
            <div
              className="bg-white/10 w-[290px] h-[290px] p-[32px] rounded-full flex flex-col space-y-4 justify-center text-center p-8 touch-none relative"
              id="slider"
            >
              {readyToCheckout && !invoicePaid ? (
                <>
                  <CartIcon className="w-24 h-24 mx-auto" />
                  <p className="text-lg text-center">
                    You’re ready to bid! Copy the invoice and pay from your
                    favorite bitcoin wallet.
                  </p>
                </>
              ) : readyToCheckout && invoicePaid ? (
                <>
                  <MusicalNoteIcon className="w-24 h-24 mx-auto" />
                  <p className="text-xl text-center">All paid! Let’s jam.</p>
                </>
              ) : (
                ``
              )}
            </div>

            {readyToCheckout && !invoicePaid ? (
              <div className="flex flex-col m-auto justify-items-center items-center gap-4">
                {loading ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    <QRCodeSVG
                      value={bolt11.paymentRequest}
                      width={'200px'}
                      height={'200px'}
                      includeMargin={true}
                    />
                    <CopyToClipboard text={bolt11.paymentRequest}>
                      <Button
                        className="w-full text-sm"
                        icon={<CopyIcon />}
                        size="small"
                      >
                        Copy Invoice
                      </Button>
                    </CopyToClipboard>
                  </>
                )}
              </div>
            ) : readyToCheckout && invoicePaid ? (
              <Button
                className="w-full"
                icon={<QueueListIcon />}
                href={`${pathname}/queue`}
                size="small"
              >
                Song Queue
              </Button>
            ) : (
              ``
            )}
          </>
        )}
      </div>

      <NavBar activeBtn="search" />
    </>
  );
}
export default PaymentScreen;
