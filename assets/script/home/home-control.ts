const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeControl extends cc.Component {
  playGame() {
    cc.director.loadScene("GameScene");
  }

  goShopping() {
    cc.director.loadScene("ShopScene");
  }
}
