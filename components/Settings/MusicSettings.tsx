import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface BannedSong {
  id: string;
  title: string;
  artist: string;
}

export function MusicSettings({
  bannedSongsPlaylist,
}: {
  bannedSongsPlaylist: any;
}) {
  const [backupPlaylist, setBackupPlaylist] = useState('');
  const [bannedSongs, setBannedSongs] = useState<BannedSong[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: session } = useSession();

  const handleSave = async () => {
    const savePromise = async () => {
      const response = await fetch('/api/hosts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotifyId: session?.user?.id,
          backupPlaylist: backupPlaylist,
          bannedSongs: bannedSongs,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update music settings');
      }

      return response.json();
    };

    return toast.promise(savePromise(), {
      loading: 'Saving...',
      success: 'Music settings updated successfully',
      error: 'Failed to update music settings',
    });
  };

  return (
    <div className="space-y-6">
      {/* Backup Playlist Section */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">Backup Playlist</h3>
        <p className="text-white/60 mb-4">
          This playlist will be used when your queue is empty.
        </p>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Paste Spotify playlist URL"
            value={backupPlaylist}
            onChange={e => setBackupPlaylist(e.target.value)}
            className="flex-1 bg-black/50 text-white border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      {/* Banned Songs Section */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">Banned Songs</h3>
        <p className="text-white/60 mb-4">
          These songs will not be allowed in your queue.
        </p>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search for a song to ban"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-black/50 text-white border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            onClick={() => console.log('Add banned song')}
          >
            <PlusIcon className="w-5 h-5" />
            Add
          </button>
          {/* <iframe
            title="Spotify Embed: Banned Songs"
            src={`https://open.spotify.com/embed/playlist/1bs2Q5EVN82Lijaw0ILaq?utm_source=generator&theme=0`}
            width="100%"
            height="152px"
            allow="encrypted-media;"
            loading="lazy"
          /> */}
        </div>

        {/* TODO: Implement Banned Songs List */}
        <div className="space-y-2">
          {bannedSongs.length !== 0 ? (
            <p className="text-white/40 text-sm">No banned songs yet</p>
          ) : (
            <div>
              <iframe
                title="Spotify Embed: Banned Songs"
                src={`https://open.spotify.com/embed/playlist/1bs2Q5EVN82LRijaw0ILaq?theme=0`}
                width="100%"
                height="152px"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy"
              />
              {/* <iframe
                title="Spotify Embed: Banned Songs"
                src={`https://open.spotify.com/embed/playlist/1bs2Q5EVN82LRijaw0ILaq?theme=0`}
                width="100%"
                height="152px"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy"
              /> */}
            </div>
            // bannedSongs.map(song => (
            //   <div
            //     key={song.id}
            //     className="flex items-center justify-between bg-black/25 p-3 rounded-md"
            //   >
            //     <div>
            //       <p className="text-white font-medium">{song.title}</p>
            //       <p className="text-white/60 text-sm">{song.artist}</p>
            //     </div>
            //     <button
            //       onClick={() => {
            //         setBannedSongs(bannedSongs.filter(s => s.id !== song.id));
            //       }}
            //       className="text-white/60 hover:text-white p-1"
            //     >
            //       <XMarkIcon className="w-5 h-5" />
            //     </button>
            //   </div>
            // ))
          )}
        </div>
      </div>
    </div>
  );
}
