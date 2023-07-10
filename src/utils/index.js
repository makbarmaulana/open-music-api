/* eslint-disable camelcase */

const mapAlbumsDBToModel = ({ cover, ...album }) => ({
  ...album,
  coverUrl: cover,
});

const mapSongsDBToModel = ({ album_id, ...song }) => ({
  ...song,
  albumId: album_id,
});

const mapPlaylistsDBToModel = ({ id, name, username }) => ({
  id,
  name,
  username,
});

const mapPlaylistSongsDBToModel = ({ song_id, title, performer }) => ({
  id: song_id,
  title,
  performer,
});

const mapPlaylistActivitiesDBToModel = ({ ...activities }) => ({
  ...activities,
});

module.exports = {
  mapAlbumsDBToModel,
  mapSongsDBToModel,
  mapPlaylistsDBToModel,
  mapPlaylistSongsDBToModel,
  mapPlaylistActivitiesDBToModel,
};
