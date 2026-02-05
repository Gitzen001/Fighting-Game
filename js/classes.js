class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
  }) {
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 15;
    this.offset = offset;
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.framesCurrent * (this.image.width / this.framesMax),
      0,
      this.image.width / this.framesMax,
      this.image.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      (this.image.width / this.framesMax) * this.scale,
      this.image.height * this.scale,
      
    );
    if (this.isShielding && !this.isShieldBroken) {
    ctx.beginPath();
    // Draws a blue glowing circle around the player
    ctx.arc(
      this.position.x + this.width / 2, 
      this.position.y + this.height / 2, 
      this.height / 1.5, 0, Math.PI * 2
    );
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Optional: Add a subtle fill
    ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
    ctx.fill();
    ctx.closePath();

    // Draw Shield Health Bar above the player
    ctx.fillStyle = "black";
    ctx.fillRect(this.position.x, this.position.y - 30, this.width, 10);
    ctx.fillStyle = "cyan";
    ctx.fillRect(
      this.position.x, 
      this.position.y - 30, 
      (this.shieldHealth / this.maxShieldHealth) * this.width, 
      10
    );
  }

    //     if (!this.canAttack && !this.isAttacking) {
    //       ctx.globalAlpha = 0.5; // Make them slightly transparent
    //     } else {
    //       ctx.globalAlpha = 1.0;
    //     }
    //         // ctx.fillStyle = this.color;
    //         // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    //     ctx.globalAlpha = 1.0;
    //     if (this.isShielding && !this.isShieldBroken) {
    //       ctx.strokeStyle = "cyan";
    //       ctx.lineWidth = 5;
    //       ctx.strokeRect(
    //         this.position.x - 5,
    //         this.position.y - 5,
    //         this.width + 10,
    //         this.height + 10,
    //       );
    //       // Shield Health Bar
    //       ctx.fillStyle = "cyan";
    //       ctx.fillRect(
    //         this.position.x,
    //         this.position.y - 20,
    //         (this.shieldHealth / this.maxShieldHealth) * this.width,
    //         10,
    //       );
    //     }
  }
  animateFrames() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }
  update() {
    this.draw();
    this.animateFrames();
  }
}
class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = "red",
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined },
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset,
    });
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height,
    };
    this.color = color;
    this.isAttacking;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 15;
    this.sprites = sprites;
    this.canAttack = true;
    this.health = 100;
    this.isShielding = false;
    this.shieldHealth = 100;
    this.maxShieldHealth = 100;
    this.isShieldBroken = false;

    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image();
      sprites[sprite].image.src = sprites[sprite].imageSrc;
    }
  }

update() {
    this.draw();
    
    // Only animate the character if they are NOT dead
    if (!this.dead) {
      this.animateFrames();
    }

    // Update attack box position relative to player
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    // Shield mechanics logic
    if (!this.isShielding || this.isShieldBroken) {
      if (this.shieldHealth < this.maxShieldHealth) {
        this.shieldHealth += 0.2;
      }
    }
    if (this.shieldHealth >= this.maxShieldHealth) {
      this.isShieldBroken = false;
    }
    if (this.shieldHealth <= 0) {
      this.shieldHealth = 0;
      this.isShieldBroken = true;
      this.isShielding = false;
    }

    // Movement physics
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Screen boundary checks (Left and Right)
    if (this.position.x <= 0) {
      this.position.x = 0;
    }
    if (this.position.x + this.width >= canvas.width) {
      this.position.x = canvas.width - this.width;
    }

    // Ground collision and Gravity logic
    if (this.position.y + this.height >= canvas.height - 96) {
      this.velocity.y = 0;
      this.position.y = canvas.height - 96 - this.height;
    } else {
      this.velocity.y += gravity; 
    }
  }
  attack() {
    if (!this.canAttack || this.isShielding) return;
    this.switchSprite("attack1");
    this.isAttacking = true;
    this.canAttack = false;
    setTimeout(() => {
      this.canAttack = true;
    }, 500);
  }
  takeHit() {
    if (this.isShielding && !this.isShieldBroken) {
    this.shieldHealth -= 20;
    if (this.shieldHealth <= 0) {
      this.isShieldBroken = true;
      this.isShielding = false;
    }
    return;
  }
    this.health -= 10;
    if (this.health <= 0) {
      this.switchSprite("death");
    } else {
      this.switchSprite("takeHit");
    }
  }

  switchSprite(sprite) {
    if (this.image === this.sprites.death.image) {
    if (this.framesCurrent === this.sprites.death.framesMax - 1) {
      this.dead = true;
    }
    return;
  }
    if (
      this.image === this.sprites.attack1.image &&
      this.framesCurrent < this.sprites.attack1.framesMax - 1
    )
      return;

    if (
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.framesMax - 1
    ) {
      return;
    }
    switch (sprite) {
      case "idle":
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image;
          this.framesMax = this.sprites.idle.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "run":
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image;
          this.framesMax = this.sprites.run.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "jump":
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image;
          this.framesMax = this.sprites.jump.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "fall":
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image;
          this.framesMax = this.sprites.fall.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "attack1":
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image;
          this.framesMax = this.sprites.attack1.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "takeHit":
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image;
          this.framesMax = this.sprites.takeHit.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case "death":
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image;
          this.framesMax = this.sprites.death.framesMax;
          this.framesCurrent = 0;
        }
        break;
    }
  }
}
