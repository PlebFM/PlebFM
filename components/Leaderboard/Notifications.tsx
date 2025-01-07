import Avatar from '../Utils/Avatar';
import { usePusher } from '../hooks/usePusher';

type Props = {
  refreshQueue: () => void;
  host: string;
};

export const Notifications = ({ refreshQueue, host }: Props) => {
  const { notifications } = usePusher(refreshQueue, host);
  return (
    <div className="absolute top-0 left-0">
      <div className="flex flex-row justify-between p-8 pt-0 pr-0">
        <div className="w-full flex flex-col space-y-2 pr-4 pt-4 max-w-1">
          {notifications.map((update, key) => (
            <div
              key={key}
              className="flex space-x-4 justify-start items-center overflow-hidden bg-pfm-purple-400/50 h-12 rounded p-4 z-50 drop-shadow-2xl animate-fade-out"
            >
              <div className="w-12">
                <Avatar
                  firstNym={update?.user?.firstNym}
                  lastNym={update?.user?.lastNym}
                  color={update?.user?.color}
                  size="xs"
                />
              </div>
              <p className="text-sm truncate">
                <strong>
                  {update?.user?.firstNym} {update?.user?.lastNym}
                </strong>{' '}
                {update?.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
