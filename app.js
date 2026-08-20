const defaultPeople = [
  { name: "Maya Chen", role: "Close friend", initials: "MC", color: "#e8a49d", ring: 1, angle: 0.4, direction: 1, speed: 0.0003, targetSpeed: 0.0003, nextChange: 0 },
  { name: "Noah Williams", role: "Family", initials: "NW", color: "#e9b47d", ring: 2, angle: 2.4, direction: -1, speed: 0.0004, targetSpeed: 0.0004, nextChange: 0 },
  { name: "Ari Rivera", role: "Work friend", initials: "AR", color: "#e6cb83", ring: 3, angle: 4.1, direction: 1, speed: 0.0002, targetSpeed: 0.0002, nextChange: 0 },
  { name: "Sam Okafor", role: "Mentor", initials: "SO", color: "#acd18e", ring: 4, angle: 1.2, direction: -1, speed: 0.0005, targetSpeed: 0.0005, nextChange: 0 },
  { name: "Lena Park", role: "Friend", initials: "LP", color: "#9bcde0", ring: 5, angle: 3.2, direction: 1, speed: 0.00035, targetSpeed: 0.00035, nextChange: 0 },
  { name: "Theo Martin", role: "Neighbor", initials: "TM", color: "#c0a4d0", ring: 6, angle: 5.1, direction: -1, speed: 0.00025, targetSpeed: 0.00025, nextChange: 0 },
  { name: "Priya Shah", role: "Classmate", initials: "PS", color: "#83b7d4", ring: 7, angle: 0.9, direction: 1, speed: 0.00045, targetSpeed: 0.00045, nextChange: 0 },
  { name: "Eli Brooks", role: "Acquaintance", initials: "EB", color: "#7695c3", ring: 8, angle: 3.8, direction: -1, speed: 0.0003, targetSpeed: 0.0003, nextChange: 0 }
];

const map = document.querySelector("#circle-map");
const peopleLayer = document.querySelector("#people-layer");
const ringStage = document.querySelector(".ring-stage");
const ringSizes = [22, 32, 42, 52, 62, 72, 82, 92];
let people = [...defaultPeople];

function render() {
  peopleLayer.replaceChildren();

  people.forEach((person, index) => {
    const node = document.createElement("div");
    node.className = "person-node";
    node.dataset.index = index;
    node.dataset.ring = person.ring;
    node.innerHTML = `<span class="person-face" style="background:${person.color}">${person.initials}</span><span class="person-name">${person.name}</span><span class="person-role">${person.role}</span>`;
    peopleLayer.append(node);
  });
}

function randomSpeed() {
  return 0.00015 + Math.random() * 0.0005;
}

function animatePeople(timestamp) {
  const mapBounds = map.getBoundingClientRect();
  const stageBounds = ringStage.getBoundingClientRect();
  const centerX = stageBounds.left + stageBounds.width / 2;
  const centerY = stageBounds.top + stageBounds.height / 2;

  people.forEach((person, index) => {
    if (timestamp >= person.nextChange) {
      person.targetSpeed = randomSpeed();
      person.nextChange = timestamp + 1400 + Math.random() * 2800;
    }
    person.speed += (person.targetSpeed - person.speed) * 0.012;
    person.angle += person.speed * person.direction;

    const radius = stageBounds.width * (ringSizes[person.ring - 1] / 100) / 2;
    const x = centerX + Math.cos(person.angle) * radius;
    const y = centerY + Math.sin(person.angle) * radius;
    const node = peopleLayer.children[index];
    node.style.left = `${((x - mapBounds.left) / mapBounds.width) * 100}%`;
    node.style.top = `${((y - mapBounds.top) / mapBounds.height) * 100}%`;
  });

  requestAnimationFrame(animatePeople);
}

document.querySelector("#reset-map").addEventListener("click", () => {
  people = [...defaultPeople];
  render();
});
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("is-active", item === tab);
    item.setAttribute("aria-selected", item === tab);
  });
}));

render();
requestAnimationFrame(animatePeople);
