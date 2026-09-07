import {
  activateTorrent,
  addTorrent,
  addTorrentByLink,
  buildAllTorrentsPlaylistUrl,
  buildFileStreamUrl,
  buildTorrentPlaylistUrl,
  buildTorrentStreamUrl,
  dropTorrent,
  getAllTorrentsPlaylist,
  getTorrServerSettings,
  getTorrServerStats,
  getTorrServerStorageSettings,
  getTorrServerTMDBSettings,
  getTorrServerTorrent,
  getTorrServerVersion,
  listTorrent,
  listViewedTorrents,
  markViewedTorrent,
  primeTorrentPlayback,
  removeTorrent,
  removeViewedTorrent,
  searchRutor,
  searchTorznab,
  updateTorrServerStorageSettings,
  uploadTorrentFile,
} from "../torrserver";

export const torrServerLibraryClient = {
  add: addTorrent,
  addByLink: addTorrentByLink,
  drop: dropTorrent,
  get: getTorrServerTorrent,
  list: listTorrent,
  remove: removeTorrent,
  upload: uploadTorrentFile,
} as const;

export const torrServerPlaybackClient = {
  activate: activateTorrent,
  allPlaylist: getAllTorrentsPlaylist,
  buildAllPlaylistUrl: buildAllTorrentsPlaylistUrl,
  buildFileStreamUrl,
  buildPlaylistUrl: buildTorrentPlaylistUrl,
  buildStreamUrl: buildTorrentStreamUrl,
  prime: primeTorrentPlayback,
} as const;

export const torrServerSearchClient = {
  rutor: searchRutor,
  torznab: searchTorznab,
} as const;

export const torrServerViewedClient = {
  list: listViewedTorrents,
  mark: markViewedTorrent,
  remove: removeViewedTorrent,
} as const;

export const torrServerSettingsClient = {
  get: getTorrServerSettings,
  getStorage: getTorrServerStorageSettings,
  getTmdb: getTorrServerTMDBSettings,
  updateStorage: updateTorrServerStorageSettings,
} as const;

export const torrServerDiagnosticsClient = {
  stats: getTorrServerStats,
  version: getTorrServerVersion,
} as const;
