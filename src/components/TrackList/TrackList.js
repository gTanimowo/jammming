import React from "react";
import Track from "../Track/Track";

const TrackList = ({ tracks, isRemoval, onAction }) => {
  return (
    <div>
      {tracks.map((track) => (
        <Track
          key={track.id}
          track={track}
          isRemoval={isRemoval}
          onAction={onAction}
        />
      ))}
    </div>
  );
};

export default TrackList;
