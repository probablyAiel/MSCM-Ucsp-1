const defaultPeople = [];

const map = document.querySelector("#circle-map");
const cardEdit = document.querySelector("#card-edit");
const editPersonIndex = document.querySelector("#edit-person-index");
const personDialogEyebrow = document.querySelector("#person-dialog-eyebrow");
const addPersonTitle = document.querySelector("#add-person-title");
const savePersonSubmit = document.querySelector("#save-person-submit");
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
const resetPasswordDialog = document.querySelector("#reset-password-dialog");
const resetPasswordForm = document.querySelector("#reset-password-form");
const resetPasswordInput = document.querySelector("#reset-password");
const resetPasswordError = document.querySelector("#reset-password-error");
const personForm = document.querySelector("#person-form");
const imageInput = document.querySelector("#person-image");
const imageLabel = document.querySelector("#image-label");
const formError = document.querySelector("#form-error");
const listView = document.querySelector("#list-view");
const peopleDirectory = document.querySelector("#people-directory");
const listCount = document.querySelector("#list-count");
const listSummaryCount = document.querySelector("#list-summary-count");
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

// 1. Select the button element
const shareLinkButton = document.querySelector("#share-link-button");

// 2. Add the copy function
async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    
    // Provide visual feedback
    const originalText = shareLinkButton.textContent;
    shareLinkButton.textContent = "✓";
    shareLinkButton.style.color = "#4ade80"; // soft green feedback
    
    setTimeout(() => {
      shareLinkButton.textContent = originalText;
      shareLinkButton.style.color = "";
    }, 2000);
  } catch (err) {
    // Fallback if clipboard API is restricted
    const tempInput = document.createElement("input");
    tempInput.value = window.location.href;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    
    alert("Link copied to clipboard!");
  }
}

// 3. Attach the event listener
shareLinkButton.addEventListener("click", copyShareLink);

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToUtf8(base64) {
  let str = base64.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  const binString = atob(str);
  const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// 1. Select the new elements
const exportButton = document.querySelector("#export-button");
const importButton = document.querySelector("#import-button");
const importFileInput = document.querySelector("#import-file-input");

// 2. Export function (Downloads a JSON file of your circle)
function exportCircle() {
  if (!people.length) {
    alert("There are no people in your circle to export.");
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(people, null, 2));
  const downloadAnchor = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `social-circle-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// 3. Import function (Reads uploaded JSON file and updates the map)
function importCircle(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!Array.isArray(importedData)) {
        throw new Error("Invalid file format. Expected a list of people.");
      }

      // Restore required properties if missing
      importedData.forEach((person) => {
        if (typeof person.orbitOffset !== "number") person.orbitOffset = Math.random() * Math.PI * 2;
        if (typeof person.wobblePhase !== "number") person.wobblePhase = Math.random() * Math.PI * 2;
        if (typeof person.speed !== "number") person.speed = 0.0003;
        if (typeof person.targetSpeed !== "number") person.targetSpeed = 0.0003;
      });

      people = importedData;
      savePeople();
      render();
      alert("Social circle imported successfully!");
    } catch (err) {
      alert("Could not import file: " + err.message);
    } finally {
      importFileInput.value = ""; // Reset input
    }
  };
  reader.readAsText(file);
}

// 4. Attach Event Listeners
exportButton.addEventListener("click", exportCircle);
importButton.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", importCircle);

function loadPeople() {
  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const jsonString = base64ToUtf8(hash);
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (err) {
    console.warn("Could not load state from URL hash:", err);
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) && saved.length ? saved : [...defaultPeople];
  } catch {
    return [...defaultPeople];
  }
}

function savePeople() {
  localStorage.setItem(storageKey, JSON.stringify(people));

  try {
    // Strip heavy base64 images from the URL state to keep the link shareable and under browser URL length limits
    const cleanPeople = people.map(({ image, ...rest }) => ({
      ...rest,
      image: image && image.length > 500 ? "" : image
    }));

    const jsonString = JSON.stringify(cleanPeople);
    const encoded = utf8ToBase64(jsonString);
    history.replaceState(null, "", `#${encoded}`);
  } catch (err) {
    console.error("Could not save state to URL hash:", err);
  }
}

function openEditPersonDialog(index) {
  const person = people[index];
  if (!person) return;

  formError.textContent = "";
  editPersonIndex.value = index;

  // Change modal copy for edit mode
  personDialogEyebrow.textContent = "Edit connection";
  addPersonTitle.textContent = `Edit ${person.name}`;
  savePersonSubmit.textContent = "Save changes";

  // Pre-fill inputs
  document.querySelector("#person-full-name").value = person.name || "";
  document.querySelector("#person-relationship").value = person.role || "";
  document.querySelector("#person-ring").value = person.ring;
  document.querySelector("#person-main").checked = !!person.main;
  document.querySelector("#person-note").value = person.note || "";
  imageLabel.textContent = person.image ? "Change portrait" : "Add a portrait";

  personDialog.classList.add("is-open");
  personDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function openPersonDialog() {
  formError.textContent = "";
  personForm.reset();
  editPersonIndex.value = "";
  
  // Reset modal copy back to default
  personDialogEyebrow.textContent = "New connection";
  addPersonTitle.textContent = "Add someone to your circle";
  savePersonSubmit.textContent = "Add to map";
  imageLabel.textContent = "Add a portrait";

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

function openResetPasswordDialog() {
  resetPasswordError.textContent = "";
  resetPasswordInput.value = "";
  resetPasswordDialog.classList.add("is-open");
  resetPasswordDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  resetPasswordInput.focus();
}

function closeResetPasswordDialog() {
  resetPasswordDialog.classList.remove("is-open");
  resetPasswordDialog.setAttribute("aria-hidden", "true");
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
  listSummaryCount.textContent = String(people.length).padStart(2, "0");
  if (!people.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.innerHTML = "<span class=\"list-empty-mark\">+</span><strong>Your circle is ready for its first person.</strong><span>Use Add person to begin building the map.</span>";
    peopleDirectory.append(empty);
    return;
  }

  groupNames.forEach((groupName, ringIndex) => {
    const members = people.filter((person) => person.ring === ringIndex + 1);
    if (!members.length) return;
    const details = document.createElement("details");
    details.className = "directory-group-section";
    details.open = true;
    const summary = document.createElement("summary");
    summary.innerHTML = `<span class="group-dot" style="background:${ringColors[ringIndex]}"></span><span>${groupName}</span><small>${members.length} ${members.length === 1 ? "person" : "people"}</small>`;
    details.append(summary);
    const cards = document.createElement("div");
    cards.className = "directory-cards";
    members.forEach((person) => {
      const card = document.createElement("button");
      card.className = "directory-card";
      card.type = "button";
      card.style.setProperty("--card-ring-color", ringColors[ringIndex]);
      card.innerHTML = `<span class="directory-avatar" style="background-color:${person.color}${person.image ? `;background-image:url('${person.image}')` : ""}">${person.initials}</span><span class="directory-main"><strong>${person.name}</strong><span>${person.role}</span></span><span class="directory-note">${person.note}</span>${person.main ? "<span class=\"main-badge\">Main connector</span>" : ""}`;
      card.addEventListener("click", () => {
        peopleDirectory.querySelectorAll(".directory-card").forEach((item) => item.classList.remove("is-active"));
        card.classList.add("is-active");
      });
      cards.append(card);
    });
    details.append(cards);
    peopleDirectory.append(details);
  });
}

function showPersonCard(person) {
  pendingPerson = person;
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
    showPersonCard(person);
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
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("Please choose an image smaller than 10 MB."));
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 300x300 for avatar portraits
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP/JPEG at 0.75 quality to drastically reduce byte size
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error("Failed to process image structure."));
      img.src = reader.result;
    });
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
  const indexVal = editPersonIndex.value;
  const isEditing = indexVal !== "";

  if (!name || !role || !ring) return;

  try {
    const existingPerson = isEditing ? people[Number(indexVal)] : null;
    let image = existingPerson ? existingPerson.image : "";

    // If a new image file was uploaded, process it
    if (imageInput.files && imageInput.files[0]) {
      image = await readImage(imageInput.files[0]);
    }

    if (main) {
      people.forEach((person, idx) => {
        if (person.ring === ring && idx !== Number(indexVal)) {
          person.main = false;
        }
      });
    }

    const updatedData = {
      name,
      role,
      initials: initialsFor(name),
      color: ringColors[ring - 1],
      ring,
      main,
      image,
      note: formData.get("note").trim() || `${name} is part of my ${groupNames[ring - 1].toLowerCase()} circle.`
    };

    if (isEditing) {
      // Update existing record
      Object.assign(people[Number(indexVal)], updatedData);
    } else {
      // Create new record
      people.push({
        ...updatedData,
        orbitOffset: people.some((person) => person.ring === ring) ? Math.random() * Math.PI * 2 : 0,
        angle: Math.random() * Math.PI * 2,
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: 0.0003,
        targetSpeed: 0.0003,
        nextChange: 0,
        wobblePhase: Math.random() * Math.PI * 2
      });
    }

    await savePeople();
    render();
    personForm.reset();
    imageLabel.textContent = "Add a portrait";
    closePersonCard();
    closePersonDialog();
  } catch (error) {
    formError.textContent = error.message;
  }
}

function unlockAddPerson(event) {
  event.preventDefault();
  if (passwordInput.value !== "born") {
    passwordError.textContent = "That password does not unlock this workspace.";
    passwordInput.select();
    return;
  }
  closePasswordDialog();
  openPersonDialog();
}

cardEdit.addEventListener("click", () => {
  if (pendingPerson) {
    const index = people.indexOf(pendingPerson);
    if (index !== -1) {
      openEditPersonDialog(index);
    }
  }
});

function unlockReset(event) {
  event.preventDefault();
  if (resetPasswordInput.value !== "aspiANDgaudi") {
    resetPasswordError.textContent = "That password does not unlock reset access.";
    resetPasswordInput.select();
    return;
  }
  closeResetPasswordDialog();
  closePersonCard();
  people = [...defaultPeople];
  localStorage.removeItem(storageKey);
  render();
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
  openResetPasswordDialog();
});
cardClose.addEventListener("click", closePersonCard);
document.querySelector("#add-person-button").addEventListener("click", openPasswordDialog);
document.querySelector("#dialog-close").addEventListener("click", closePersonDialog);
document.querySelector("#cancel-person").addEventListener("click", closePersonDialog);
document.querySelector("#password-close").addEventListener("click", closePasswordDialog);
document.querySelector("#password-cancel").addEventListener("click", closePasswordDialog);
document.querySelector("#reset-password-close").addEventListener("click", closeResetPasswordDialog);
document.querySelector("#reset-password-cancel").addEventListener("click", closeResetPasswordDialog);
passwordForm.addEventListener("submit", unlockAddPerson);
resetPasswordForm.addEventListener("submit", unlockReset);
personDialog.addEventListener("click", (event) => {
  if (event.target === personDialog) closePersonDialog();
});
passwordDialog.addEventListener("click", (event) => {
  if (event.target === passwordDialog) closePasswordDialog();
});
resetPasswordDialog.addEventListener("click", (event) => {
  if (event.target === resetPasswordDialog) closeResetPasswordDialog();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (passwordDialog.classList.contains("is-open")) closePasswordDialog();
  if (personDialog.classList.contains("is-open")) closePersonDialog();
  if (resetPasswordDialog.classList.contains("is-open")) closeResetPasswordDialog();
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

// --- DOM SELECTORS ---
const exportButton = document.querySelector("#export-button");
const importButton = document.querySelector("#import-button");
const importFileInput = document.querySelector("#import-file-input");

// --- SHARE LINK HANDLER ---
if (shareLinkButton) {
  shareLinkButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const originalText = shareLinkButton.textContent;
      shareLinkButton.textContent = "✓";
      setTimeout(() => {
        shareLinkButton.textContent = originalText;
      }, 2000);
    } catch (err) {
      const tempInput = document.createElement("input");
      tempInput.value = window.location.href;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      alert("Link copied to clipboard!");
    }
  });
}

// --- EXPORT HANDLER ---
if (exportButton) {
  exportButton.addEventListener("click", () => {
    if (!people.length) {
      alert("There are no people in your circle to export.");
      return;
    }
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(people, null, 2));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `social-circle-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  });
}

// --- IMPORT HANDLER ---
if (importButton && importFileInput) {
  importButton.addEventListener("click", () => {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid file format. Expected a list of people.");
        }

        importedData.forEach((person) => {
          if (typeof person.orbitOffset !== "number") person.orbitOffset = Math.random() * Math.PI * 2;
          if (typeof person.wobblePhase !== "number") person.wobblePhase = Math.random() * Math.PI * 2;
          if (typeof person.speed !== "number") person.speed = 0.0003;
          if (typeof person.targetSpeed !== "number") person.targetSpeed = 0.0003;
        });

        people = importedData;
        savePeople();
        render();
        alert("Social circle imported successfully!");
      } catch (err) {
        alert("Could not import file: " + err.message);
      } finally {
        importFileInput.value = "";
      }
    };
    reader.readAsText(file);
  });
}

render();
requestAnimationFrame(animatePeople);
