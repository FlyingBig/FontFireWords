class BoomFire {
  constructor(value, option = {}) {
    let defualtConfig = {
      infinite: false,
      width: 1900,
      height: 800,
      duration: 2, // 爆炸后持续时间
      particles: 50, // 爆炸散点数量
    };
    this.value = value;
    this.boomConfig = Object.assign({}, defualtConfig, option);
    this.createCanvas();
    this.showMaker = this.createBoomFire(value); // 爆竹数据
    this.animation();
  }
  createCanvas() {
    let fireWorkCanvas = document.createElement("canvas");
    fireWorkCanvas.width = this.boomConfig.width;
    fireWorkCanvas.height = this.boomConfig.height;
    let insetNode = this.boomConfig.insetId
      ? document.querySelector(`#${this.boomConfig.insetId}`)
      : document.body;
    insetNode.append(fireWorkCanvas);
    this.canvasFire = fireWorkCanvas;
  }
  /**
   *
   * @param {number} x 发射点最高的横坐标
   * @param {number} y 发射点最高的纵坐标
   * @param {string} value 待绘制的文字
   * @returns
   */
  getFontPosition(x, y, value) {
    let fontWidth = value.length * 24;
    let canvas = document.createElement("canvas");
    canvas.height = fontWidth;
    canvas.width = fontWidth;
    let canvasContent = canvas.getContext("2d");
    canvasContent.font = "24px Arial";
    canvasContent.clearRect(0, 0, fontWidth, 40);
    canvasContent.textBaseline = "middle";
    canvasContent.fillText(value, 0, fontWidth / 2);
    let centerBase = fontWidth / 2;
    let data = canvasContent.getImageData(0, 0, fontWidth, fontWidth).data;
    let positionArray = [];
    for (let height = 0; height < fontWidth; height += 2) {
      for (let width = 0; width < fontWidth; width += 2) {
        let index = (height * fontWidth + width) * 4;
        if (data[index + 3]) {
          positionArray.push({
            x: x + (width - centerBase) * 8, // 把原来的坐标都扩大8倍
            y: y + (height - centerBase) * 8,
            size: 1,
            speed: 0.15,
            direction: Math.atan2(height - centerBase, width - centerBase),
            color: `${~~(Math.random() * 256)},${~~(Math.random() * 256)},${~~(
              Math.random() * 256
            )}`,
          });
        }
      }
    }
    return positionArray;
  }
  createBoomFire(value) {
    let type = ["number", "string"]; // 被允许的参数类型
    let data = [];
    if (type.includes(typeof value)) {
      let boomData, boomsLength;
      if (typeof value === "number") {
        boomsLength = value;
      } else {
        boomData = value.split(",");
        boomsLength = boomData.length;
      }

      let splitWidth = this.canvasFire.width / boomsLength;
      for (let i = 0; i < boomsLength; i++) {
        let spendRandom = Math.random() * 10 + 36;
        let startX = i * splitWidth + splitWidth / 2;
        data.push({
          speed: spendRandom,
          blastTime: 5,
          runTime: 0,
          shootTime: Math.random() * 2.5,
          startY: 800,
          startX: startX,
          color: `rgba(${~~(Math.random() * 256)},${~~(
            Math.random() * 256
          )},${~~(Math.random() * 256)},${Math.random().toFixed(2)})`,
          boomShapes:
            typeof value === "number"
              ? this.createNormalBoomFire(
                  startX,
                  800 - (spendRandom * 4 - 9.8 * 8) * 7
                )
              : this.createFontBoomFire(
                  startX,
                  800 - (spendRandom * 4 - 9.8 * 8) * 7,
                  boomData[i]
                ),
        });
      }
      return data;
    } else {
      console.error("非法类型参数传入,请使用Number/String类型参数");
    }
  }
  createNormalBoomFire(x, y) {
    let data = [];
    for (let i = 0; i < this.boomConfig.particles; i++) {
      data.push({
        x,
        y,
        direction: (~~(Math.random() * 360) * Math.PI) / 180,
        speed: Math.random() * 1.2,
        size: Math.random() * 1 + 1,
        color: `${~~(Math.random() * 256)},${~~(Math.random() * 256)},${~~(
          Math.random() * 256
        )}`,
      });
    }
    return data;
  }
  createFontBoomFire(x, y, value) {
    let data = this.getFontPosition(x, y, value);
    let data1 = this.createNormalBoomFire(x, y);
    return [...data, ...data1];
  }
  animation() {
    let canvas = this.canvasFire;
    let ctx = canvas.getContext("2d");
    let opinters = this.showMaker;
    let maxShootTime = Math.max.apply(
      null,
      opinters.map((item) => item.shootTime)
    );
    let time = 0;
    let rafId;
    function render() {
      let renderBind = render.bind(this);
      rafId = requestAnimationFrame(renderBind);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      time += 0.017;
      opinters.forEach((item) => {
        let obj = item;
        let currentTime = time - obj.shootTime;
        if (currentTime > 0 && currentTime < 4) {
          let rt = time - obj.shootTime;
          let move = obj.speed * rt - (9.8 * rt * rt) / 2;
          ctx.beginPath();
          ctx.fillStyle = obj.color;
          ctx.ellipse(
            obj.startX,
            obj.startY - move * 7,
            3,
            4,
            Math.PI,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.closePath();
        } else if (
          currentTime > 4 &&
          currentTime <= 4 + this.boomConfig.duration
        ) {
          for (let i = 0; i < obj.boomShapes.length; i++) {
            let boomTime = currentTime - 4;
            let alphaColor =
              1 - Math.pow(10, boomTime - this.boomConfig.duration);
            let v = obj.boomShapes[i];
            let color = `rgba(${v.color},${alphaColor})`;
            ctx.fillStyle = color;
            let vx = Math.cos(v.direction) * v.speed;
            let vy = Math.sin(v.direction) * v.speed + 0.08;
            v.x += vx;
            v.y += vy;
            ctx.beginPath();
            ctx.ellipse(v.x, v.y, v.size, v.size, Math.PI, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
          }
        }
      });
      if (time - maxShootTime > 4 + this.boomConfig.duration + 0.2) {
        cancelAnimationFrame(rafId);
        if (this.boomConfig.infinite) {
          this.showMaker = this.createBoomFire(this.value);
          this.animation();
        }
      }
      
      
    }
    render.bind(this)();
  }
}
