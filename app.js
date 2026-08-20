const defaultPeople = [
  { name: "Maya Chen", role: "Close friend", initials: "MC", color: "#e8a49d", ring: 1, image: "https://i.pravatar.cc/480?img=47", note: "Maya is in my primary group because she is one of the people I trust with the everyday parts of life.", angle: 0.4, direction: 1, speed: 0.0003, targetSpeed: 0.0003, nextChange: 0 },
  { name: "Noah Williams", role: "Family", initials: "NW", color: "#e9b47d", ring: 2, image: "https://i.pravatar.cc/480?img=12", note: "Noah is part of my secondary group: close enough to matter, with a bond shaped by family and shared history.", angle: 2.4, direction: -1, speed: 0.0004, targetSpeed: 0.0004, nextChange: 0 },
  { name: "Ari Rivera", role: "Work friend", initials: "AR", color: "#e6cb83", ring: 3, image: "https://i.pravatar.cc/480?img=32", note: "Ari belongs here because their perspective influences how I think, work, and grow.", angle: 4.1, direction: 1, speed: 0.0002, targetSpeed: 0.0002, nextChange: 0 },
  { name: "Sam Okafor", role: "Mentor", initials: "SO", color: "#acd18e", ring: 4, image: "https://i.pravatar.cc/480?img=68", note: "Sam is in my in-group because we share values, trust, and a sense of belonging.", angle: 1.2, direction: -1, speed: 0.0005, targetSpeed: 0.0005, nextChange: 0 },
  { name: "Lena Park", role: "Friend", initials: "LP", color: "#9bcde0", ring: 5, image: "https://i.pravatar.cc/480?img=25", note: "Lena is in my out-group: still part of my wider social world, but not part of my closest everyday circle.", angle: 3.2, direction: 1, speed: 0.00035, targetSpeed: 0.00035, nextChange: 0 },
  { name: "Theo Martin", role: "Neighbor", initials: "TM", color: "#c0a4d0", ring: 6, image: "https://i.pravatar.cc/480?img=59", note: "Theo is in my virtual group because most of our connection and conversations happen through screens.", angle: 5.1, direction: -1, speed: 0.00025, targetSpeed: 0.00025, nextChange: 0 },
  { name: "Priya Shah", role: "Classmate", initials: "PS", color: "#83b7d4", ring: 7, image: "https://i.pravatar.cc/480?img=44", note: "Priya represents Gemeinschaft: a connection grounded in familiarity, community, and shared belonging.", angle: 0.9, direction: 1, speed: 0.00045, targetSpeed: 0.00045, nextChange: 0 },
  { name: "Eli Brooks", role: "Acquaintance", initials: "EB", color: "#7695c3", ring: 8, image: "https://i.pravatar.cc/480?img=11", note: "Eli represents Gesellschaft: a social connection shaped by context, roles, and the wider structure around us.", angle: 3.8, direction: -1, speed: 0.0003, targetSpeed: 0.0003, nextChange: 0 }
];

const map = document.querySelector("#circle-map");
const ringTracks = [...document.querySelectorAll(".ring-track")];
const personCard = document.querySelector("#person-card");
const cardClose = document.querySelector("#card-close");
const cardPortrait = document.querySelector("#card-portrait");
const cardName = document.querySelector("#card-name");
const cardRole = document.querySelector("#card-role");
const cardGroup = document.querySelector("#card-group");
const cardNote = document.querySelector("#card-note");
const groupNames = ["Primary Groups", "Secondary Groups", "Reference Groups", "In Groups", "Out Groups", "Virtual Groups", "Gemeinschaft", "Gesellschaft"];
let people = [...defaultPeople];
let isPaused = false;

function render() {
  ringTracks.forEach((track) => track.replaceChildren());

  people.forEach((person) => {
      const node = document.createElement("button");
    node.className = "person-node";
      node.type = "button";
      node.setAttribute("aria-label", `Show information about ${person.name}`);
    node.dataset.ring = person.ring;
    node.innerHTML = `<span class="person-face" style="background:${person.color}">${person.initials}</span><span class="person-name">${person.name}</span><span class="person-role">${person.role}</span>`;
    ringTracks[person.ring - 1].append(node);
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        selectPerson(person);
      });

    const face = node.querySelector(".person-face");
    node.style.setProperty("--face-half", `${face.offsetHeight / 2}px`);
  });
}

function selectPerson(person) {
  isPaused = true;
  people.forEach((item) => {
    item.nextChange = Infinity;
  });
  person.angle = 0;
  ringTracks.forEach((track) => track.classList.remove("is-focused"));
  ringTracks[person.ring - 1].classList.add("is-focused");
  ringTracks[person.ring - 1].style.transform = "rotate(0rad)";
  document.querySelectorAll(".person-node").forEach((node) => node.classList.toggle("is-selected", node.dataset.ring === String(person.ring)));
  cardPortrait.src = person.image;
  cardPortrait.alt = `${person.name} portrait`;
  cardPortrait.style.backgroundColor = person.color;
  cardName.textContent = person.name;
  cardRole.textContent = person.role;
  cardGroup.textContent = groupNames[person.ring - 1];
  cardNote.textContent = person.note;
  personCard.classList.add("is-visible");
  personCard.setAttribute("aria-hidden", "false");
}

function closePersonCard() {
  isPaused = false;
  personCard.classList.remove("is-visible");
  personCard.setAttribute("aria-hidden", "true");
  ringTracks.forEach((track) => track.classList.remove("is-focused"));
  document.querySelectorAll(".person-node").forEach((node) => node.classList.remove("is-selected"));
  people.forEach((item) => {
    item.nextChange = 0;
  });
}

function randomSpeed() {
  return 0.00015 + Math.random() * 0.0005;
}

let previousTimestamp = 0;

function animatePeople(timestamp) {
  const delta = previousTimestamp ? Math.min(timestamp - previousTimestamp, 32) : 16;
  previousTimestamp = timestamp;
  people.forEach((person, index) => {
    if (isPaused) return;
    if (timestamp >= person.nextChange) {
      person.targetSpeed = randomSpeed();
      person.nextChange = timestamp + 1400 + Math.random() * 2800;
    }
    const smoothing = 1 - Math.exp(-delta / 900);
    person.speed += (person.targetSpeed - person.speed) * smoothing;
    person.angle += person.speed * delta * person.direction;

    ringTracks[index].style.transform = `rotate(${person.angle}rad)`;
  });

  requestAnimationFrame(animatePeople);
}

document.querySelector("#reset-map").addEventListener("click", () => {
  closePersonCard();
  people = [...defaultPeople];
  render();
});
cardClose.addEventListener("click", closePersonCard);
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("is-active", item === tab);
    item.setAttribute("aria-selected", item === tab);
  });
}));

render();
requestAnimationFrame(animatePeople);
