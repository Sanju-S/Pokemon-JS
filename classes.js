class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
  }) {
    this.position = position;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapsed: 0 };

    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
    };
    this.image.src = image.src;

    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
    this.rotation = rotation;
  }

  draw() {
    c.save();
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );
    c.globalAlpha = this.opacity;
    c.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max, // crop image
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    );

    if (!this.animate) return;

    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
    c.restore();
  }
}

class Monster extends Sprite {
  constructor({
    name,
    position,
    velocity,
    image,
    sprites,
    attacks,
    health,
    isEnemy = false,
    frames = { max: 1, hold: 10 },
    animate = false,
    rotation = 0,
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation,
    });
    // this.health = isEnemy === true ? 11 : 100;
    this.health = health;
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
    this.totalHealth = health;
  }

  attack({ attack, recipient, renderedSprites }) {
    document.querySelector("#dialog-box").style.display = "block";
    document.querySelector(
      "#dialog-box"
    ).innerHTML = `${this.name} used ${attack.name}`;
    let bgColor;

    const healthBar = this.isEnemy ? "#player-health-bar" : "#enemy-health-bar";
    const healthNum = this.isEnemy ? "#player-health-num" : "#enemy-health-num";
    recipient.health =
      recipient.health - attack.damage <= 0
        ? 0
        : recipient.health - attack.damage;
    const healthPercent = (recipient.health / recipient.totalHealth) * 100;

    if (recipient.health <= 20) bgColor = "red";
    else if (recipient.health <= 50) bgColor = "yellow";
    else bgColor = "green";

    let rotation = this.isEnemy ? -2.2 : 1;

    switch (attack.name) {
      case "Tackle":
        const tl = gsap.timeline();

        let movementDistance = 20;
        if (this.isEnemy) movementDistance = -20;

        tl.to(this.position, {
          x: this.position.x - movementDistance,
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              audio.tackleHit.play();
              gsap.to(healthBar, {
                width: healthPercent + "%",
              });
              document.querySelector(
                healthNum
              ).innerHTML = `${recipient.health}/${recipient.totalHealth}`;
              document.querySelector(healthBar).style.backgroundColor = bgColor;
              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            x: this.position.x - 20,
          });
        break;

      case "Fireball":
        audio.initFireball.play();
        const fireballImage = new Image();
        fireballImage.src = "./img/fireball.png";
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10,
          },
          animate: true,
          rotation,
        });
        renderedSprites.splice(1, 0, fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            audio.fireballHit.play();
            gsap.to(healthBar, {
              width: healthPercent + "%",
            });
            document.querySelector(
              healthNum
            ).innerHTML = `${recipient.health}/${recipient.totalHealth}`;
            document.querySelector(healthBar).style.backgroundColor = bgColor;
            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });
        break;
    }

    // const healthNumber = document.querySelector(healthNum);
    // healthNumber.innerHTML = `${recipient.health}/${recipient.totalHealth}`;

    // document.querySelector(healthBar).style.backgroundColor = bgColor;
  }

  faint() {
    document.querySelector("#dialog-box").innerHTML = `${this.name} fainted!`;
    gsap.to(this.position, {
      y: this.position.y + 30,
    });
    gsap.to(this, {
      opacity: 0,
    });
    if (this.isEnemy) audio.victory.play();
    audio.battle.stop();
  }

  updateHealthMenu(recipient, bgColor) {
    document.querySelector(
      this.healthNum
    ).innerHTML = `${recipient.health}/${recipient.totalHealth}`;
    document.querySelector(this.healthBar).style.backgroundColor = bgColor;
  }
}

class Boundary {
  static width = 48;
  static height = 48;

  constructor({ position }) {
    this.position = position;
    this.width = 48;
    this.height = 48;
  }

  draw() {
    c.fillStyle = "rgba(255, 0, 0, 0)";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
