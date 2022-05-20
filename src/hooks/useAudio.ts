import useAudioStore from '@/stores/audio'
import usePlaylistItemStore from '@/stores/playlist-item'
export const useAudio = (isNotClickAudioList: boolean = true) => {
  const audioStore = useAudioStore()
  const playlistItemStore = usePlaylistItemStore()

  // 改变排序
  const changeOrder = (audio: any) => {
    audioStore.audioList.find((item, index) => {
      if (item.id == audio.id) {
        audioStore.order = index
        localStorage.setItem('order', index.toString())
        return item.id === audio.id
      }
    })
  }

  // 在歌单里播放单首歌曲
  const playAudio = (audio: any) => {
    if (audio.id === audioStore.audioId) return
    // 判断是否点击的是播放列表里面的item
    if (isNotClickAudioList) {
      localStorage.setItem(
        'audioList',
        JSON.stringify(playlistItemStore.playlistSongs)
      )
      audioStore.changeAudioList(playlistItemStore.playlistSongs)
    }
    changeOrder(audio)
    audioStore.audioId = audio.id
    localStorage.setItem('audioId', audio.id)
  }

  // 播放全部
  const handlePlayAll = () => {
    localStorage.setItem(
      'audioList',
      JSON.stringify(playlistItemStore.playlistSongs)
    )
    audioStore.changeAudioList(playlistItemStore.playlistSongs)
    localStorage.setItem('audioId', audioStore.audioList[0].id.toString())
    audioStore.audioId = audioStore.audioList[0].id
    audioStore.order = 1
  }

  return { playAudio, changeOrder, handlePlayAll }
}