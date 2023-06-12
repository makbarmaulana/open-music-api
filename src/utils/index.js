/* eslint-disable camelcase */

const mapSongsDBToModel = ({
  album_id,
  ...args
}) => ({
  ...args,
  albumId: album_id,
});

module.exports = { mapSongsDBToModel };
