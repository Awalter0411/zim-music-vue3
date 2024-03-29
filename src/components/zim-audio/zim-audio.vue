<!-- 底部播放器 -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  VideoPlay,
  VideoPause,
  CaretLeft,
  CaretRight,
  SetUp
} from '@element-plus/icons-vue'
import { audioFetch } from '@/apis'
import { timeToMinute } from '@/utils/audio'
import useAudioStore from '@/stores/audio'
import AudioList from './audio-list.vue'
import AudioInfo from './audio-info.vue'
import { IGetAudioDetailRes, IGetAudioLyricRes } from '@/models/audio'

const audioRef = ref<HTMLAudioElement | null>(null)
const currentAudioDetail = ref<IGetAudioDetailRes | null>(null)
const currentAudioUrl = ref('')
const currentAudioLyric = ref<IGetAudioLyricRes | null>(null)
const volume = ref(0)
const currentProgress = ref(0.5)
const currentTime = ref('00:00')
const isShowPlayIcon = ref(true)
const isInit = ref(false)
const audioStore = useAudioStore()
const isAudioListShow = ref(false)
const isAudioInfoShow = ref(false)

const getAudio = async () => {
  currentAudioDetail.value = await audioFetch.getAudioDetail(audioStore.audioId)
  // 获取到当前歌曲的持续时间
  currentAudioDetail.value.duration =
    timeToMinute(currentAudioDetail.value.songs[0]?.dt / 1000) || '0'
  // 获取到当前歌曲的url
  currentAudioUrl.value = (
    await audioFetch.getAudioUrl(audioStore.audioId)
  ).data[0].url
  currentAudioLyric.value = await audioFetch.getAudioLyric(audioStore.audioId)
}

// 初始化
const initAudio = async () => {
  audioStore.audioId = parseInt(localStorage.getItem('audioId') || '0')
  audioStore.order = parseInt(localStorage.getItem('order') || '0')
  if (!audioStore.audioId) {
    return
  }
  await getAudio()
  if (audioRef.value) {
    audioRef.value.volume = 0.5
    volume.value = audioRef.value.volume * 100
  }
  isInit.value = true
}

// 切歌
const changeAudio = async () => {
  currentTime.value = '00:00'
  isShowPlayIcon.value = true
  // 判断是否点击的是同一首歌曲
  if (!audioStore.audioId) {
    return
  }
  await getAudio()
  if (isInit.value) {
    audioRef.value?.play()
  }
}

onMounted(initAudio)
watch(() => audioStore.audioId, changeAudio)

// 播放
const playAudio = () => {
  audioRef.value?.play()
}

// 暂停
const pauseAudio = () => {
  audioRef.value?.pause()
}

// 音乐播放的回调
const audioPlaying = () => {
  isShowPlayIcon.value = false
}

// 音乐暂停的回调
const audioPausing = () => {
  isShowPlayIcon.value = true
}

// 改变进度条
const changeProgress = (val: number) => {
  if (audioRef.value) {
    currentProgress.value = val
    audioRef.value.currentTime = (val * audioRef.value.duration) / 100
  }
}

// 改变音量
const changeVolume = (val: number) => {
  if (audioRef.value) {
    volume.value = val
    audioRef.value.volume = val / 100
  }
}

// 时间变化
const watchCurrentTimeChange = () => {
  if (audioRef.value && !isNaN(audioRef.value.duration)) {
    currentTime.value = timeToMinute(audioRef.value.currentTime)!
    currentProgress.value =
      (audioRef.value.currentTime / audioRef.value.duration) * 100
  }
}

// 上一首歌曲
const prevAudio = () => {
  if (audioStore.order >= 1) {
    audioStore.audioId = audioStore.audioList[audioStore.order - 1].id
    --audioStore.order
    localStorage.setItem('order', audioStore.order.toString())
    localStorage.setItem('audioId', audioStore.audioId.toString())
  }
}

// 下一首歌曲
const nextAudio = () => {
  if (audioStore.order + 1 < audioStore.audioList.length) {
    audioStore.audioId = audioStore.audioList[audioStore.order + 1].id
    ++audioStore.order
    localStorage.setItem('order', audioStore.order.toString())
    localStorage.setItem('audioId', audioStore.audioId.toString())
  }
}

// 单首歌曲结束
const handleAudioEnd = () => {
  nextAudio()
}

// 展示播放列表
const showAudioList = () => {
  isAudioListShow.value = !isAudioListShow.value
}

// 显示歌曲详情，歌曲详情组件包含歌词，评论等信息
const showAudioInfo = () => {
  isAudioInfoShow.value = !isAudioInfoShow.value
}
</script>

<template>
  <div class="zim-audio">
    <div class="info">
      <el-image
        @click="showAudioInfo"
        v-if="Object.keys(currentAudioDetail || {}).length !== 0"
        class="audio-cover"
        :src="
          currentAudioDetail?.songs && currentAudioDetail.songs[0]?.al.picUrl
        "
      ></el-image>
      <div class="desc">
        <div class="audio-name">
          {{ currentAudioDetail?.songs && currentAudioDetail.songs[0]?.name }}
        </div>
        <div class="audio-artist">
          {{
            currentAudioDetail?.songs && currentAudioDetail.songs[0]?.ar[0].name
          }}
        </div>
      </div>
    </div>
    <div class="control">
      <div class="operate">
        <div class="prev">
          <el-icon :size="20" @click="prevAudio"><CaretLeft /></el-icon>
        </div>
        <div class="pause" @click="pauseAudio" v-show="!isShowPlayIcon">
          <el-icon :size="30"><VideoPause /></el-icon>
        </div>
        <div class="play" @click="playAudio" v-show="isShowPlayIcon">
          <el-icon :size="30"><VideoPlay /></el-icon>
        </div>
        <div class="next" @click="nextAudio">
          <el-icon :size="20"><CaretRight /></el-icon>
        </div>
      </div>
      <div class="progress">
        <audio
          autoplay
          @ended="handleAudioEnd"
          @play="audioPlaying"
          @pause="audioPausing"
          @timeupdate="watchCurrentTimeChange"
          :src="currentAudioUrl"
          ref="audioRef"
        ></audio>
        <div class="current-times">{{ currentTime }}</div>
        <el-slider
          @input="changeProgress"
          v-model="currentProgress"
          size="small"
          :show-tooltip="false"
        />
        <div class="duration-times">{{ currentAudioDetail?.duration }}</div>
      </div>
    </div>
    <div class="settings">
      <div>
        <el-slider
          v-model="volume"
          vertical
          height="30px"
          style="width: 38px"
          @input="changeVolume"
        />
      </div>
      <div>
        <el-icon @click="showAudioList"><SetUp /></el-icon>
        <audio-list v-show="isAudioListShow" />
      </div>
    </div>
    <transition name="fade">
      <audio-info
        v-show="isAudioInfoShow"
        :current-audio-detail="currentAudioDetail!"
        :current-audio-lyric="currentAudioLyric!"
        :current-time="currentTime"
      />
    </transition>
  </div>
</template>

<style lang="scss">
@import '@/assets/styles/base.scss';
.zim-audio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #eee;
  width: 100%;
  height: 100%;
  .info {
    flex: 1;
    display: flex;
    align-items: center;
    .audio-cover {
      margin-right: 1rem;
      width: 5rem;
      height: 5rem;
      border-radius: 10%;
    }
    .audio-name {
      width: 20rem;
      font-size: 1.4rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 1rem;
    }
    .audio-artist {
      font-size: 1.3rem;
    }
  }
  .control {
    flex: 1;
    .operate {
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      .play,
      .pause {
        margin: 0 5rem;
      }
      .prev:hover,
      .play:hover,
      .pause:hover,
      .next:hover {
        cursor: pointer;
        color: $primary-color;
      }
    }
    .progress {
      flex: 1;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: rgb(138, 138, 138);

      .current-times {
        padding-right: 1.5rem;
      }
      .duration-times {
        padding-left: 1rem;
      }
    }
  }
  .settings {
    flex: 1;
    display: flex;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.el-slider__button {
  height: 1rem;
  width: 1rem;
  border: 1px solid $primary-color;
}
.el-slider__bar {
  height: 0.4rem;
  background-color: $primary-color !important;
}
</style>
