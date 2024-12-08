import { useState } from 'react';
import AlbumScreen from './AlbumScreen';
import PaymentScreen from './PaymentScreen';
import SelectBid from './SelectBid';
import { Song } from '../../models/Song';

type Props = {
  song: Song;
  parentCallback: (choice: string) => void;
  slug: string;
};

export default function Checkout({ song, parentCallback }: Props) {
  const [songConfirmed, setSongConfirmed] = useState(false);
  const [readyToCheckout, setReadyToCheckout] = useState(false);
  const [invoicePaid, setInvoicePaid] = useState(false);
  const [totalBid, setTotalBid] = useState(0);

  const cancelSong = () => {
    parentCallback('');
  };

  // Displays album art, user has chance to back out of song
  if (!songConfirmed) {
    return (
      <AlbumScreen
        track={song}
        setSongConfirmed={setSongConfirmed}
        cancelSong={cancelSong}
      />
    );
  }
  // User has confirmed bid amount, display invoice OR display that invoice has been successfully paid
  else if (readyToCheckout || invoicePaid) {
    return (
      <PaymentScreen
        song={song}
        readyToCheckout={readyToCheckout}
        invoicePaid={invoicePaid}
        onPaid={() => setInvoicePaid(true)}
        totalBid={totalBid}
      />
    );
  }
  // User has confirmed song, displays radial slider to choose bid amount
  else {
    return (
      <SelectBid
        song={song}
        setReadyToCheckout={setReadyToCheckout}
        cancelSong={cancelSong}
        setTotalBid={setTotalBid}
      />
    );
  }
}
