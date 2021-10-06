const { ccclass, property } = cc._decorator;

export enum SoundType {
  AudioFly = 0,
  AudioScore,
  AudioDie,
}

@ccclass
export default class AudioControl extends cc.Component {
  @property(cc.AudioClip)
  audioBg: cc.AudioClip = null;

  @property(cc.AudioClip)
  typeAudio: cc.AudioClip[] = [null, null, null];

  start() {
    cc.audioEngine.playMusic(this.audioBg, true);
    cc.audioEngine.setMusicVolume(0.25);
  }

  playAudio(type: SoundType) {
    cc.audioEngine.playEffect(this.typeAudio[type], false);
    cc.audioEngine.setEffectsVolume(0.5);
  }
}
