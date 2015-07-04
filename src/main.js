define(function (require, exports, module) {

  const Plugin = require('extplug/Plugin')
  const PlaylistImporter = require('./PlaylistImporter')
  const YouTubeImporter = require('./YouTubeImporter')
  const YTPlaylistService = require('plug/actions/youtube/YouTubePlaylistService')
  const YTImportService = require('plug/actions/youtube/YouTubeImportService')
  const { around } = require('meld')

  const PLAYLIST_URL = 'https://www.youtube.com/playlist?list='
  const CHANNEL_URL = 'https://www.youtube.com/channel/'

  const YouTubeImport = Plugin.extend({
    name: 'YouTube Import',
    description: 'Mostly working YouTube importing functions.',

    enable() {
      this.plAdvice = around(YTPlaylistService.prototype, 'load', joinpoint => {
        let [ username, cb ] = joinpoint.args
        // strip channel URL prefix
        if (username.indexOf(CHANNEL_URL) === 0) {
          username = username.slice(CHANNEL_URL.length)
        }
        // strip URL suffixes like /videos, /playlists
        if (username.indexOf('/') !== -1) {
          username = username.split('/')[0]
        }
        new YouTubeImporter(username).loadAll((err, result) => {
          cb(result)
        })
      })
      this.imAdvice = around(YTImportService.prototype, 'load', joinpoint => {
        let [ playlist, isFaves, cb ] = joinpoint.args
        new PlaylistImporter(playlist).loadAll((err, result) => {
          cb(result)
        })
      })
    },

    disable() {
      this.plAdvice.remove()
      this.imAdvice.remove()
    }
  })

  module.exports = YouTubeImport

})
