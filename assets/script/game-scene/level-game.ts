const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelGame extends cc.Component {
  @property(cc.Prefab)
  levelsPrefab: cc.Prefab = null;

  @property(cc.Integer)
  completionLevel: number = 5; //pass 5 pipes, you're complete

  @property(cc.Integer)
  speedOfBird: number = 2;

  @property(cc.Integer)
  moveSpeed: number = 1.0;

  @property(cc.SpriteFrame)
  spfBg: cc.SpriteFrame = null;

  @property(cc.Integer)
  numberOfPipesToMoveUpDown: number = 0;
}
