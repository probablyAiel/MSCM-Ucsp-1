const defaultPeople = [
  { name: "Maya Chen", role: "Close friend", initials: "MC", color: "#f0cd69", x: 23, y: 29, time: "2d ago" },
  { name: "Noah Williams", role: "Family", initials: "NW", color: "#9bcfb5", x: 76, y: 28, time: "5d ago" },
  { name: "Ari Rivera", role: "Work friend", initials: "AR", color: "#ec7c62", x: 18, y: 70, time: "1w ago" },
  { name: "Sam Okafor", role: "Mentor", initials: "SO", color: "#89c9de", x: 82, y: 68, time: "2w ago" },
  { name: "Lena Park", role: "Friend", initials: "LP", color: "#d4eb64", x: 50, y: 13, time: "3w ago" },
  { name: "Theo Martin", role: "Neighbor", initials: "TM", color: "#d9b4c6", x: 50, y: 87, time: "1mo ago" }
];

const map = document.querySelector("#circle-map");
const peopleLayer = document.querySelector("#people-layer");
let people = [...defaultPeople];

function render() {
  peopleLayer.replaceChildren();

  people.forEach((person, index) => {
    const node = document.createElement("div");
    node.className = "person-node";
    node.style.left = `${person.x}%`;
    node.style.top = `${person.y}%`;
    node.dataset.index = index;
    node.innerHTML = `<span class="person-face" style="background:${person.color}">${person.initials}</span><span class="person-name">${person.name}</span><span class="person-role">${person.role}</span>`;
    makeDraggable(node, person);
    peopleLayer.append(node);
  });
}

function makeDraggable(node, person) {
  node.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    node.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      const bounds = map.getBoundingClientRect();
      person.x = Math.max(8, Math.min(92, ((moveEvent.clientX - bounds.left) / bounds.width) * 100));
      person.y = Math.max(8, Math.min(92, ((moveEvent.clientY - bounds.top) / bounds.height) * 100));
      node.style.left = `${person.x}%`;
      node.style.top = `${person.y}%`;
    };
    const stop = () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", stop);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", stop);
  });
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
