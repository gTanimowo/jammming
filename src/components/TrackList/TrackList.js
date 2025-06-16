import React from "react";
import Track from "../Track/Track";

const TrackList = ({ tracks, isRemoval }) => {
  return (
    <div>
      {tracks.map((track) => (
        <Track key={track.id} track={track} isRemoval={isRemoval} />
      ))}
    </div>
  );
};

export default TrackList;
