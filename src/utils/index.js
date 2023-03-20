/* eslint-disable camelcase */
const AlbumsMapDBToModel = ({
  id,
  name,
  year,
  created_at,
  updated_at,
  cover_url,
}) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
  coverUrl: cover_url,
});

const PlaylistsMapDBToModel = ({
  id,
  name,
  owner,
  username,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  owner,
  username,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = {
  AlbumsMapDBToModel,
  PlaylistsMapDBToModel,
};
