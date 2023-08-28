export const CheckoutHeader = ({
  song,
}: {
  song: {
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string };
  };
}) => {
  if (!song) return <></>;
  return (
    <div className="w-full">
      <p className="text-xl truncate">{song?.name}</p>
      <p className="text-lg font-bold truncate">{song?.artists[0]?.name}</p>
      <p className="text-base truncate">{song?.album?.name}</p>
    </div>
  );
};
