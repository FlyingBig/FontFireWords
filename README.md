# 使用步骤
引入fireWorks.js
```
调用 new BoomFire(param1, param2);
param1  type => number/string 若为number就是普通烟花效果，如果string就是文字效果烟花(多个文字使用,隔开)
param2 type => object
  {
    infinite: false, // 循环
    width: 1900, // 画布的width
    height: 800, // 画布的height
    duration: 2, // 爆炸后持续时间
    particles: 50, // 爆炸散点数量
  }
```
