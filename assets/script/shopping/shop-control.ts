const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopControl extends cc.Component {
  listItem: cc.Sprite[] = [null, null, null, null, null, null, null];
  currentIndex: number = -1;

  onLoad() {
    this.listItem = this.node
      .getChildByName("view")
      ?.getChildByName("content")
      ?.getComponentsInChildren(cc.Sprite);
  }

  start() {
    this.addEventButton();
  }

  addEventButton() {
    for (let i = 0; i < this.listItem.length; i++) {
      this.listItem[i].node.getComponent(cc.Button).node.on(
        cc.Node.EventType.TOUCH_START,
        () => {
          this.handleEvenButton(i);
        },
        this
      );
    }
  }

  handleEvenButton(index: number) {
    cc.tween(this.listItem[index].node).to(1, { scale: 1.5 }).start();

    if (this.currentIndex != -1) {
      cc.tween(this.listItem[this.currentIndex].node)
        .to(1, { scale: 1 })
        .start();
    }

    this.currentIndex = index;
  }

  HandleBackBtn() {
    cc.director.loadScene("Home");
  }
}
