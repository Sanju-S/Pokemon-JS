// battle scene
const battleBgImage = new Image();
battleBgImage.src = "./img/battleBackground.png";
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBgImage,
});

let draggle;
let emby;
let battleAnimationId;
let queue;
let renderedSprites;

function initBattle() {
  // set some defaults
  document.querySelector("#user-interface").style.display = "block";
  document.querySelector("#dialog-box").style.display = "none";
  document.querySelector("#enemy-health-bar").style.width = "100%";
  document.querySelector("#player-health-bar").style.width = "100%";
  document.querySelector("#enemy-health-bar").style.backgroundColor = "green";
  document.querySelector("#player-health-bar").style.backgroundColor = "green";
  document.querySelector("#attack-box").replaceChildren();

  // dragon monster
  draggle = new Monster(monsters.Draggle);
  document.querySelector(
    "#enemy-health-num"
  ).innerHTML = `${draggle.health}/${draggle.totalHealth}`;

  // emby monster
  emby = new Monster(monsters.Emby);
  document.querySelector(
    "#player-health-num"
  ).innerHTML = `${emby.health}/${emby.totalHealth}`;

  // animate battle
  renderedSprites = [draggle, emby];

  queue = [];

  // create dynamic attack button
  emby.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attack-box").append(button);
  });

  // event listeners for buttons (attack)
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites,
      });

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          gsap.to("#overlapping-div", {
            opacity: 1,
            onComplete: () => {
              window.cancelAnimationFrame(battleAnimationId);
              animate();
              document.querySelector("#user-interface").style.display = "none";
              gsap.to("#overlapping-div", {
                opacity: 0,
              });

              battle.initiated = false;
              audio.Map.play();
            },
          });
        });
        return;
      }

      // draggel or enemy attacks
      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites,
        });

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });

          queue.push(() => {
            gsap.to("#overlapping-div", {
              opacity: 1,
              onComplete: () => {
                window.cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector("#user-interface").style.display =
                  "none";
                gsap.to("#overlapping-div", {
                  opacity: 0,
                });

                battle.initiated = false;
                audio.Map.play();
              },
            });
          });
        }
      });
    });

    button.addEventListener("mouseenter", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector("#attack-data").innerHTML = selectedAttack.type;
      document.querySelector("#attack-data").style.color = selectedAttack.color;
    });
  });
}

// animate the battle sequence
function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();
  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

// animate();
// initBattle();
// animateBattle();

document.querySelector("#dialog-box").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else e.currentTarget.style.display = "none";
});
