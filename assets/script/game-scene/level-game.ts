const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelGame extends cc.Component {
  @property(cc.Prefab)
  levelGamePrefab: cc.Prefab = null;

  @property(cc.Integer)
  completionLevel: number = 5; //pass 5 pipes, you're complete

  @property(cc.Integer)
  speedOfBird: number = 2;
}
