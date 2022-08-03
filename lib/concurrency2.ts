/**
 * 分批次加入待处理异步请求_2
 */
class _Scheduler {
  private queue: (() => Promise<unknown>)[];
  private max: number;
  private index: number;
  constructor(n: number) {
    this.queue = [];
    this.max = n;
    this.index = 0;
    setTimeout(() => this.run(), 0); // 使用箭头函数绑定this
  }
  add(promiseFunc: () => Promise<unknown>): Promise<unknown> {
    return new Promise((resolve) => {
      const wrapperFunc = () => promiseFunc().then(resolve);
      this.queue.push(wrapperFunc);
      this.run();
    });
  }
  run() {
    while (this.index < this.queue.length && this.max > 0) {
      console.log("hhhhhhhhhhh", this.index);
      this.max--;
      this.queue[this.index++]().then(() => {
        this.max++;
        this.run();
      });
    }
  }
}
const _scheduler = new _Scheduler(2);
const _delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));
const _addTask = (time: number, order: number) => {
  _scheduler.add(() => _delay(time)).then(() => console.log(order));
};
_addTask(1000, 1);
console.log(111);
_addTask(500, 2);
console.log(222);
_addTask(300, 3);
console.log(333);
_addTask(400, 4);
console.log(444);
setTimeout(() => {
  console.log(555);
  _addTask(200, 5);
}, 100);
// log: 2 3 1 4
