export default function SearchResults(props: {songs: string[]}) {
  return (
      <ol>
        {props.songs ? props.songs.map((x, i) =>
          <li key={i}>{x}</li>
        ) : <li>Loading</li>}
      </ol>
  )

}