'use client';

import { useEffect, useState } from 'react';

// sample track id: '0V3wPSX9ygBnCm8psDIegu'

export default function CheckoutTemp() {
    const [song, setSong] = useState('coolSong');
    const [bid, setBid] = useState(10000);
    const [bolt11, setBolt11] = useState({
        hash: '',
        paymentRequest: '',
    });
    const [isPaid, setIsPaid] = useState(false);

    const handleSongChange = (event: any) => {
        setSong(event.target.value);
    };

    const handleBidChange = (event: any) => {
        setBid(event.target.value);
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const response = await fetch('/api/invoice', {
            method: 'POST',
            body: JSON.stringify({ value: bid, memo: song }),
        });
        const data = await response.json();
        setBolt11(data);
    };

    const getPaidStatus = async () => {
        const response = await fetch(`/api/invoice?hash=${bolt11.hash}`);
        const data = await response.json();
        if (data.settled === true) setIsPaid(true);
    };

    useEffect(() => {
        if (bolt11.hash) {
            const interval = setInterval(() => {
                console.log('checking paid status...');
                getPaidStatus();
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [bolt11]);

    return (
        <div style={{ backgroundColor: 'black' }}>
            <form onSubmit={handleSubmit}>
                <label style={{ color: 'white' }}>
                    Enter song id:
                    <input
                        style={{ backgroundColor: 'teal' }}
                        type="text"
                        value={song}
                        onChange={handleSongChange}
                    />
                </label>
                <br />
                <br />
                <label style={{ color: 'white' }}>
                    Bid amount (sats):
                    <input
                        style={{ backgroundColor: 'teal' }}
                        type="text"
                        value={bid}
                        onChange={handleBidChange}
                    />
                </label>
                <br />
                <br />
                <input
                    style={{ backgroundColor: 'gray', color: 'white' }}
                    type="submit"
                    value="Submit (get invoice)"
                />
            </form>
            <>
                <br />
                <div style={{ color: 'white', maxWidth: '10rem' }}>
                    Payment request: {bolt11.paymentRequest}
                </div>
                <div style={{ color: 'white', maxWidth: '10rem' }}>
                    Paid status: {JSON.stringify(isPaid)}
                </div>
            </>
            {}
        </div>
    );
}
