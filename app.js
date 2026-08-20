const defaultPeople = [];

const map = document.querySelector("#circle-map");
const ringTracks = [...document.querySelectorAll(".ring-track")];
const connectionLines = [...document.querySelectorAll(".connection")];
const youNode = document.querySelector(".you-node");
const personCard = document.querySelector("#person-card");
const cardClose = document.querySelector("#card-close");
const cardPortrait = document.querySelector("#card-portrait");
const cardName = document.querySelector("#card-name");
const cardRole = document.querySelector("#card-role");
const cardGroup = document.querySelector("#card-group");
const cardNote = document.querySelector("#card-note");
const personDialog = document.querySelector("#person-dialog");
const passwordDialog = document.querySelector("#password-dialog");
const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#add-password");
const passwordError = document.querySelector("#password-error");
const personForm = document.querySelector("#person-form");
const imageInput = document.querySelector("#person-image");
const imageLabel = document.querySelector("#image-label");
const formError = document.querySelector("#form-error");
const listView = document.querySelector("#list-view");
const peopleDirectory = document.querySelector("#people-directory");
const listCount = document.querySelector("#list-count");
const mapPanel = document.querySelector("#map-panel");
const groupNames = ["Primary Groups", "Secondary Groups", "Reference Groups", "In Groups", "Out Groups", "Virtual Groups", "Gemeinschaft", "Gesellschaft"];
const ringColors = ["#e8a49d", "#e9b47d", "#e6cb83", "#acd18e", "#9bcde0", "#c0a4d0", "#83b7d4", "#7695c3"];
const storageKey = "social-circle-people-clean-slate-v1";
let people = loadPeople();
let isPaused = false;
let pendingPerson = null;
const ringAngles = groupNames.map((_, index) => people.find((person) => person.ring === index + 1)?.angle || 0);
const ringSpeeds = groupNames.map(() => 0.0003);
const ringTargetSpeeds = groupNames.map(() => 0.0003);
const ringNextChanges = groupNames.map(() => 0);

people.forEach((person) => {
  if (typeof person.orbitOffset !== "number") person.orbitOffset = 0;
  if (typeof person.wobblePhase !== "number") person.wobblePhase = Math.random() * Math.PI * 2;
});

function loadPeople() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) && saved.length ? saved : [...defaultPeople];
  } catch {
    return [...defaultPeople];
  }
}

function savePeople() {
  localStorage.setItem(storageKey, JSON.stringify(people));
}

function openPersonDialog() {
  formError.textContent = "";
  personDialog.classList.add("is-open");
  personDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector("#person-full-name").focus();
}

function openPasswordDialog() {
  passwordError.textContent = "";
  passwordInput.value = "";
  passwordDialog.classList.add("is-open");
  passwordDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  passwordInput.focus();
}

function closePersonDialog() {
  personDialog.classList.remove("is-open");
  personDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function closePasswordDialog() {
  passwordDialog.classList.remove("is-open");
  passwordDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function render() {
  ringTracks.forEach((track) => track.replaceChildren());

  people.forEach((person, index) => {
    const track = ringTracks[person.ring - 1];
    if (!track) return;
    const orbit = document.createElement("div");
    orbit.className = "person-orbit";
    orbit.style.setProperty("--orbit-offset", `${person.orbitOffset}rad`);
    const node = document.createElement("button");
    node.className = "person-node";
    node.type = "button";
    node.setAttribute("aria-label", `Show information about ${person.name}`);
    node.dataset.ring = person.ring;
    node.dataset.personIndex = index;
    node.innerHTML = `<span class="person-face" style="background:${person.color}${person.image ? `;background-image:url('${person.image}')` : ""}">${person.initials}</span><span class="person-name">${person.name}</span><span class="person-role">${person.role}</span>`;
    orbit.append(node);
    track.append(orbit);

    const face = node.querySelector(".person-face");
    node.style.setProperty("--face-half", `${face.offsetHeight / 2}px`);
    node.style.setProperty("--counter-rotation", `${-ringAngles[person.ring - 1] - person.orbitOffset}rad`);
  });
  renderList();
}

function renderList() {
  peopleDirectory.replaceChildren();
  listCount.textContent = `${people.length} ${people.length === 1 ? "person" : "people"}`;
  if (!people.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.innerHTML = "<span class=\"list-empty-mark\">+</span><strong>Your circle is ready for its first person.</strong><span>Use Add person to begin building the map.</span>";
    peopleDirectory.append(empty);
    return;
  }

  people.forEach((person, index) => {
    const row = document.createElement("button");
    row.className = "directory-row";
    row.type = "button";
    row.dataset.personIndex = index;
    row.innerHTML = `<span class="directory-avatar" style="background-color:${person.color}${person.image ? `;background-image:url('${person.image}')` : ""}">${person.initials}</span><span class="directory-main"><strong>${person.name}</strong><span>${person.role}</span></span><span class="directory-group">${groupNames[person.ring - 1]}</span>${person.main ? "<span class=\"main-badge\">Main</span>" : ""}`;
    row.addEventListener("click", () => selectPerson(person));
    peopleDirectory.append(row);
  });
}

function selectPerson(person) {
  isPaused = true;
  pendingPerson = person;
  personCard.classList.remove("is-visible");
  personCard.setAttribute("aria-hidden", "true");
  people.forEach((item) => {
    item.nextChange = Infinity;
  });
  const ringIndex = person.ring - 1;
  const targetOffset = -ringAngles[ringIndex];
  const shortestTurn = Math.atan2(Math.sin(targetOffset - person.orbitOffset), Math.cos(targetOffset - person.orbitOffset));
  person.orbitOffset += shortestTurn;
  ringTracks.forEach((track) => track.classList.remove("is-focused"));
  ringTracks[ringIndex].classList.add("is-focused");
  document.querySelectorAll(".person-node").forEach((node) => node.classList.toggle("is-selected", node.dataset.personIndex === String(people.indexOf(person))));
  const selectedNode = ringTracks[ringIndex].querySelector(`[data-person-index="${people.indexOf(person)}"]`);
  const selectedOrbit = selectedNode.closest(".person-orbit");
  selectedOrbit.style.setProperty("--orbit-offset", `${person.orbitOffset}rad`);
  selectedOrbit.classList.add("is-focused-orbit");
  const focusedTrack = ringTracks[ringIndex];
  const revealCard = () => {
    if (pendingPerson !== person) return;
    cardPortrait.src = person.image;
    cardPortrait.alt = `${person.name} portrait`;
    cardPortrait.style.backgroundColor = person.color;
    cardName.textContent = person.name;
    cardRole.textContent = person.role;
    cardGroup.textContent = groupNames[person.ring - 1];
    cardNote.textContent = person.note;
    personCard.classList.add("is-visible");
    personCard.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => positionPersonCard(selectedNode));
  };
  focusedTrack.addEventListener("transitionend", revealCard, { once: true });
  window.setTimeout(revealCard, 760);
}

function positionPersonCard(selectedNode) {
  if (!selectedNode || !personCard.classList.contains("is-visible")) return;
  const mapBounds = map.getBoundingClientRect();
  const nodeBounds = selectedNode.getBoundingClientRect();
  const cardWidth = personCard.getBoundingClientRect().width;
  const halfWidth = cardWidth / 2;
  const center = nodeBounds.left + nodeBounds.width / 2 - mapBounds.left;
  const left = Math.max(halfWidth + 12, Math.min(mapBounds.width - halfWidth - 12, center));
  const top = Math.max(18, Math.min(mapBounds.height - personCard.offsetHeight - 18, nodeBounds.bottom - mapBounds.top + 18));
  personCard.style.left = `${left}px`;
  personCard.style.top = `${top}px`;
}

function closePersonCard() {
  isPaused = false;
  pendingPerson = null;
  personCard.classList.remove("is-visible");
  personCard.setAttribute("aria-hidden", "true");
  ringTracks.forEach((track) => track.classList.remove("is-focused"));
  document.querySelectorAll(".person-node").forEach((node) => node.classList.remove("is-selected"));
  document.querySelectorAll(".person-orbit").forEach((orbit) => orbit.classList.remove("is-focused-orbit"));
  people.forEach((item) => {
    item.nextChange = 0;
  });
}

function findPersonAtPoint(event) {
  const point = { x: event.clientX, y: event.clientY };
  let closest = null;
  let closestDistance = Infinity;
  document.querySelectorAll(".person-node").forEach((node) => {
    const bounds = node.querySelector(".person-face").getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const distance = Math.hypot(point.x - centerX, point.y - centerY);
    if (distance <= Math.max(bounds.width, bounds.height) * 0.7 && distance < closestDistance) {
      closest = people[Number(node.dataset.personIndex)];
      closestDistance = distance;
    }
  });
  return closest;
}

function updateConnections() {
  const mapBounds = map.getBoundingClientRect();
  const meBounds = youNode.getBoundingClientRect();
  const originX = meBounds.left + meBounds.width / 2;
  const originY = meBounds.top + meBounds.height / 2;

  connectionLines.forEach((line) => {
    const ring = Number(line.dataset.ring);
    let closestNode = null;
    let closestDistance = Infinity;
    const ringNodes = [...document.querySelectorAll(`.person-node[data-ring="${ring}"]`)];
    const mainNode = ringNodes.find((node) => people[Number(node.dataset.personIndex)]?.main);
    const nodesToCheck = mainNode ? [mainNode] : ringNodes;
    nodesToCheck.forEach((node) => {
      const face = node.querySelector(".person-face").getBoundingClientRect();
      const faceX = face.left + face.width / 2;
      const faceY = face.top + face.height / 2;
      const distance = Math.hypot(faceX - originX, faceY - originY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = {
          x: faceX,
          y: faceY,
          radius: face.width / 2,
          color: getComputedStyle(node.closest(".circle-ring")).getPropertyValue("--ring-color").trim()
        };
      }
    });

    if (!closestNode) {
      line.style.width = "0px";
      return;
    }
    const deltaX = closestNode.x - originX;
    const deltaY = closestNode.y - originY;
    line.style.left = `${originX - mapBounds.left}px`;
    line.style.top = `${originY - mapBounds.top}px`;
    line.style.width = `${Math.max(0, Math.hypot(deltaX, deltaY) - closestNode.radius - 4)}px`;
    line.style.transform = `rotate(${Math.atan2(deltaY, deltaX)}rad)`;
    line.style.backgroundColor = closestNode.color;
  });
}

function initialsFor(name) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Please choose an image smaller than 5 MB."));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("That image could not be read.")));
    reader.readAsDataURL(file);
  });
}

async function addPerson(event) {
  event.preventDefault();
  formError.textContent = "";
  const formData = new FormData(personForm);
  const name = formData.get("fullName").trim();
  const role = formData.get("relationship").trim();
  const ring = Number(formData.get("ring"));
  const main = formData.get("main") === "on";
  if (!name || !role || !ring) return;

  try {
    const image = await readImage(imageInput.files[0]);
    if (main) {
      people.forEach((person) => {
        if (person.ring === ring) person.main = false;
      });
    }
    people.push({
      name,
      role,
      initials: initialsFor(name),
      color: ringColors[ring - 1],
      ring,
      main,
      orbitOffset: people.some((person) => person.ring === ring) ? Math.random() * Math.PI * 2 : 0,
      image,
      note: formData.get("note").trim() || `${name} is part of my ${groupNames[ring - 1].toLowerCase()} circle.`,
      angle: Math.random() * Math.PI * 2,
      direction: Math.random() > .5 ? 1 : -1,
      speed: 0.0003,
      targetSpeed: 0.0003,
      nextChange: 0,
      wobblePhase: Math.random() * Math.PI * 2
    });
    savePeople();
    render();
    personForm.reset();
    imageLabel.textContent = "Add a portrait";
    closePersonDialog();
  } catch (error) {
    formError.textContent = error.message;
  }
}

function unlockAddPerson(event) {
  event.preventDefault();
  if (passwordInput.value !== "2010") {
    passwordError.textContent = "That password does not unlock this workspace.";
    passwordInput.select();
    return;
  }
  closePasswordDialog();
  openPersonDialog();
}

function randomSpeed() {
  return 0.00015 + Math.random() * 0.0005;
}

function rebalanceOrbitOffsets(delta, timestamp) {
  groupNames.forEach((_, ringIndex) => {
    const members = people.filter((person) => person.ring === ringIndex + 1);
    if (members.length < 2) return;
    const easing = 1 - Math.exp(-delta / 1800);
    members.forEach((person, memberIndex) => {
      const baseOffset = (memberIndex / members.length) * Math.PI * 2;
      const wobble = Math.sin(timestamp / 1100 + person.wobblePhase) * 0.08;
      const targetOffset = baseOffset + wobble;
      const correction = Math.atan2(Math.sin(targetOffset - person.orbitOffset), Math.cos(targetOffset - person.orbitOffset));
      person.orbitOffset += correction * easing;
    });
  });
}

function updateOrbitVisuals() {
  document.querySelectorAll(".person-node").forEach((node) => {
    const person = people[Number(node.dataset.personIndex)];
    if (!person) return;
    const ringIndex = person.ring - 1;
    const orbit = node.closest(".person-orbit");
    orbit.style.setProperty("--orbit-offset", `${person.orbitOffset}rad`);
    node.style.setProperty("--counter-rotation", `${-ringAngles[ringIndex] - person.orbitOffset}rad`);
  });
}

let previousTimestamp = 0;

function animatePeople(timestamp) {
  const delta = previousTimestamp ? Math.min(timestamp - previousTimestamp, 32) : 16;
  previousTimestamp = timestamp;
  if (isPaused) {
    updateConnections();
    requestAnimationFrame(animatePeople);
    return;
  }

  ringTracks.forEach((track, ringIndex) => {
    if (timestamp >= ringNextChanges[ringIndex]) {
      ringTargetSpeeds[ringIndex] = randomSpeed();
      ringNextChanges[ringIndex] = timestamp + 1400 + Math.random() * 2800;
    }
    const smoothing = 1 - Math.exp(-delta / 900);
    ringSpeeds[ringIndex] += (ringTargetSpeeds[ringIndex] - ringSpeeds[ringIndex]) * smoothing;
    ringAngles[ringIndex] += ringSpeeds[ringIndex] * delta;
    track.style.transform = `rotate(${ringAngles[ringIndex]}rad)`;
    track.querySelectorAll(".person-node").forEach((node) => {
      const owner = people[Number(node.dataset.personIndex)];
      node.style.setProperty("--counter-rotation", `${-ringAngles[ringIndex] - owner.orbitOffset}rad`);
    });
  });

  rebalanceOrbitOffsets(delta, timestamp);
  updateOrbitVisuals();

  updateConnections();

  requestAnimationFrame(animatePeople);
}

document.querySelector("#reset-map").addEventListener("click", () => {
  closePersonCard();
  people = [...defaultPeople];
  savePeople();
  render();
});
cardClose.addEventListener("click", closePersonCard);
document.querySelector("#add-person-button").addEventListener("click", openPasswordDialog);
document.querySelector("#dialog-close").addEventListener("click", closePersonDialog);
document.querySelector("#cancel-person").addEventListener("click", closePersonDialog);
document.querySelector("#password-close").addEventListener("click", closePasswordDialog);
document.querySelector("#password-cancel").addEventListener("click", closePasswordDialog);
passwordForm.addEventListener("submit", unlockAddPerson);
personDialog.addEventListener("click", (event) => {
  if (event.target === personDialog) closePersonDialog();
});
passwordDialog.addEventListener("click", (event) => {
  if (event.target === passwordDialog) closePasswordDialog();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (passwordDialog.classList.contains("is-open")) closePasswordDialog();
  if (personDialog.classList.contains("is-open")) closePersonDialog();
});
imageInput.addEventListener("change", () => {
  imageLabel.textContent = imageInput.files[0]?.name || "Add a portrait";
});
personForm.addEventListener("submit", addPerson);
map.addEventListener("click", (event) => {
  const person = findPersonAtPoint(event);
  if (person) selectPerson(person);
});
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("is-active", item === tab);
    item.setAttribute("aria-selected", item === tab);
  });
  const showList = tab.textContent.trim() === "List view";
  listView.hidden = !showList;
  map.hidden = showList;
  mapPanel.classList.toggle("list-view-active", showList);
}));

render();
requestAnimationFrame(animatePeople);
