/**
 * Frontend logic for the Undercover game.
 *
 * This version uses the FastAPI backend and supports:
 * - room creation / joining
 * - host deletion of room
 * - non-host leaving room before game starts
 * - asker / target display per round
 * - round number display
 * - restart game
 */

let currentRoomCode = localStorage.getItem("undercover_room_code") || null;
let currentPlayerId = localStorage.getItem("undercover_player_id") || null;
let currentPlayerName = localStorage.getItem("undercover_player_name") || null;
let currentRoomData = null;
let selectedVotes = [];
let cachedSecretWord = "";
let isHost = false;

const categoryLabels = {
    cars: "سيارات 🚗",
    countries: "دول 🌍",
    syrian_food: "أكلات سورية 🍲",
    football_players: "لاعبين كره قدم ⚽",
    football_teams: "فرق كره قدم 🏆",
    capitals: "عواصم 🏛️",
    syrian_series: "مسلسلات سورية 📺"
};

/**
 * Initialize page.
 */
document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();

    if (currentPlayerName) {
        const nameInput = document.getElementById("pName");
        if (nameInput) {
            nameInput.value = currentPlayerName;
        }
    }

    if (currentRoomCode) {
        const roomInput = document.getElementById("roomInput");
        if (roomInput) {
            roomInput.value = currentRoomCode;
        }
    }

    if (currentRoomCode && currentPlayerId) {
        await refreshRoomState();
    }
});

/**
 * Load categories from backend and fill the setup select.
 */
async function loadCategories() {
    const response = await fetch("/api/undercover/categories");
    const data = await response.json();

    const select = document.getElementById("mondasCat");
    if (!select) return;

    select.innerHTML = "";

    Object.keys(data.categories).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = categoryLabels[key] || key;
        select.appendChild(option);
    });
}

/**
 * Show game selection screen.
 */
function showSelection() {
    const name = document.getElementById("pName").value.trim();

    if (!name) {
        alert("الرجاء إدخال اسمك أولاً!");
        return;
    }

    currentPlayerName = name;
    localStorage.setItem("undercover_player_name", currentPlayerName);

    hideAll();
    document.getElementById("screen-select").classList.remove("hidden");
}

/**
 * Return to lobby.
 */
function goBackToLobby() {
    hideAll();
    document.getElementById("screen-lobby").classList.remove("hidden");
}

/**
 * Show Undercover setup screen.
 */
function showMondasSetup() {
    hideAll();
    document.getElementById("screen-mondas-setup").classList.remove("hidden");
}

/**
 * Create a new room.
 */
async function createRoom() {
    const hostName = currentPlayerName || document.getElementById("pName").value.trim();
    const playerCount = parseInt(document.getElementById("playerCount").value, 10);
    const undercoverCount = parseInt(document.getElementById("numSpies").value, 10);
    const category = document.getElementById("mondasCat").value;

    if (!hostName) {
        alert("الرجاء إدخال الاسم أولاً!");
        return;
    }

    const response = await fetch("/api/undercover/rooms", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            host_name: hostName,
            player_count: playerCount,
            undercover_count: undercoverCount,
            category: category
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "حدث خطأ أثناء إنشاء الغرفة.");
        return;
    }

    const hostPlayer = data.players.find((player) => player.id === data.host_id);
    if (!hostPlayer) {
        alert("تعذر تحديد صاحب الغرفة.");
        return;
    }

    currentRoomCode = data.room_code;
    currentPlayerId = data.host_id;
    currentPlayerName = hostName;
    currentRoomData = data;
    isHost = true;
    selectedVotes = [];
    cachedSecretWord = "";

    localStorage.setItem("undercover_room_code", currentRoomCode);
    localStorage.setItem("undercover_player_id", currentPlayerId);
    localStorage.setItem("undercover_player_name", currentPlayerName);

    renderWaitingRoom(data);
}

/**
 * Join an existing room.
 */
async function joinRoom() {
    const name = document.getElementById("pName").value.trim();
    const roomCode = document.getElementById("roomInput").value.trim().toUpperCase();

    if (!name || !roomCode) {
        alert("اكمل البيانات!");
        return;
    }

    const response = await fetch(`/api/undercover/rooms/${roomCode}/join`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ player_name: name })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "تعذر الانضمام إلى الغرفة.");
        return;
    }

    const joinedPlayer = data.players.find(
        (player) => player.name === name && player.id !== data.host_id
    ) || data.players[data.players.length - 1];

    currentRoomCode = roomCode;
    currentPlayerId = joinedPlayer.id;
    currentPlayerName = name;
    currentRoomData = data;
    isHost = currentPlayerId === data.host_id;
    selectedVotes = [];
    cachedSecretWord = "";

    localStorage.setItem("undercover_room_code", currentRoomCode);
    localStorage.setItem("undercover_player_id", currentPlayerId);
    localStorage.setItem("undercover_player_name", currentPlayerName);

    renderWaitingRoom(data);
}

/**
 * Start the game.
 */
async function startMondasGame() {
    const response = await fetch(`/api/undercover/rooms/${currentRoomCode}/start`, {
        method: "POST"
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "تعذر بدء اللعبة.");
        return;
    }

    currentRoomData = data;
    isHost = currentPlayerId === data.host_id;
    selectedVotes = [];
    await showRevealScreen();
}

/**
 * Show personal secret word screen.
 */
async function showRevealScreen() {
    const response = await fetch(`/api/undercover/rooms/${currentRoomCode}/reveal`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ player_id: currentPlayerId })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "تعذر جلب الكلمة.");
        return;
    }

    cachedSecretWord = data.secret_word;

    hideAll();
    document.getElementById("screen-reveal").classList.remove("hidden");

    const wordBox = document.getElementById("mondasWord");
    wordBox.textContent = cachedSecretWord;
    wordBox.classList.add("blur");
}

/**
 * Move from reveal screen to play screen.
 */
function moveToPlay() {
    if (!currentRoomData) return;
    renderPlayScreen(currentRoomData);
}

/**
 * Toggle hide/show word.
 */
function toggleRevealWord(element) {
    element.classList.toggle("blur");
}

/**
 * Refresh room state from backend.
 */
async function refreshRoomState() {
    if (!currentRoomCode) return;

    const response = await fetch(`/api/undercover/rooms/${currentRoomCode}`);

    if (!response.ok) {
        return;
    }

    const data = await response.json();
    currentRoomData = data;
    isHost = currentPlayerId === data.host_id;

    if (data.ended) {
        renderGameOver(data);
        return;
    }

    if (!data.started) {
        renderWaitingRoom(data);
        return;
    }

    if (!cachedSecretWord) {
        await showRevealScreen();
        return;
    }

    renderPlayScreen(data);
}

/**
 * Render waiting room.
 */
function renderWaitingRoom(data) {
    hideAll();
    document.getElementById("screen-wait").classList.remove("hidden");

    document.getElementById("displayCode").textContent = data.room_code;

    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";

    data.players.forEach((player) => {
        const badge = document.createElement("span");
        badge.style.background = "#333";
        badge.style.padding = "5px 10px";
        badge.style.borderRadius = "5px";
        badge.textContent = player.name;
        playerList.appendChild(badge);
    });

    const adminArea = document.getElementById("adminArea");
    const memberArea = document.getElementById("memberArea");
    const waitMsg = document.getElementById("waitMsg");

    if (isHost) {
        adminArea.classList.remove("hidden");
        memberArea.classList.add("hidden");
        waitMsg.classList.add("hidden");
    } else {
        adminArea.classList.add("hidden");
        memberArea.classList.remove("hidden");
        waitMsg.classList.remove("hidden");
    }
}

/**
 * Render play screen.
 */
function renderPlayScreen(data) {
    hideAll();
    document.getElementById("screen-play").classList.remove("hidden");

    const roundInfo = document.getElementById("roundInfo");
    roundInfo.textContent = `الجولة رقم ${data.round_number}`;

    const asker = data.players.find((player) => player.id === data.current_asker_id);
    const target = data.players.find((player) => player.id === data.current_target_id);

    const qBox = document.getElementById("qBox");
    if (asker && target) {
        qBox.textContent = `${target.name} اسأل ${asker.name}`;
    } else {
        qBox.textContent = "ابدأوا الأسئلة بين بعض بشكل حر، ثم صوّتوا على المندسين.";
    }

    const myWord = document.getElementById("myWordSmall");
    myWord.textContent = cachedSecretWord || "كلمتك";
    myWord.classList.add("blur");

    const playActions = document.getElementById("playActions");
    playActions.innerHTML = "";

    if (isHost) {
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn";
        deleteButton.textContent = "حذف الغرفة 🗑️";
        deleteButton.onclick = deleteCurrentRoom;
        playActions.appendChild(deleteButton);
    }

    renderVoters(data);
}

/**
 * Render players voting list.
 */
function renderVoters(data) {
    const container = document.getElementById("votersContainer");
    container.innerHTML = "<h4>صوّت للمندسين:</h4>";

    const backendVotes = data.votes[currentPlayerId] || [];
    if (selectedVotes.length === 0 && backendVotes.length > 0) {
        selectedVotes = [...backendVotes];
    }

    data.players.forEach((player) => {
        const div = document.createElement("div");
        div.className = "vote-item" + (player.is_eliminated ? " eliminated" : "");

        const isSelected = selectedVotes.includes(player.id);

        let buttonHtml = "";
        if (!player.is_eliminated && player.id !== currentPlayerId) {
            buttonHtml = `
                <button class="btn-sm ${isSelected ? 'btn-primary' : ''}"
                        onclick="toggleVote('${player.id}', ${data.undercover_count})">
                    ${isSelected ? 'إلغاء' : 'تصويت'}
                </button>
            `;
        }

        div.innerHTML = `
            <span>${player.name} (${player.votes_received})</span>
            ${buttonHtml}
        `;

        container.appendChild(div);
    });

    const submitButton = document.createElement("button");
    submitButton.className = "btn btn-primary";
    submitButton.textContent = "تأكيد التصويت";
    submitButton.onclick = submitVotes;
    container.appendChild(submitButton);
}

/**
 * Toggle vote selection locally before submit.
 */
function toggleVote(targetPlayerId, maxVotes) {
    if (selectedVotes.includes(targetPlayerId)) {
        selectedVotes = selectedVotes.filter((id) => id !== targetPlayerId);
    } else {
        if (selectedVotes.length >= maxVotes) {
            alert(`يمكنك التصويت على ${maxVotes} لاعب فقط`);
            return;
        }
        selectedVotes.push(targetPlayerId);
    }

    if (currentRoomData) {
        renderVoters(currentRoomData);
    }
}

/**
 * Submit votes to backend.
 */
async function submitVotes() {
    const response = await fetch(`/api/undercover/rooms/${currentRoomCode}/vote`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            voter_id: currentPlayerId,
            voted_player_ids: selectedVotes
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "تعذر إرسال التصويت.");
        return;
    }

    currentRoomData = data;
    isHost = currentPlayerId === data.host_id;
    selectedVotes = [];

    if (data.ended) {
        renderGameOver(data);
        return;
    }

    renderPlayScreen(data);

    if (data.eliminated_player_id) {
        const eliminated = data.players.find((p) => p.id === data.eliminated_player_id);

        if (eliminated) {
            if (data.eliminated_player_is_undercover) {
                alert(`تم كشف ${eliminated.name} وكان مندساً!`);
            } else {
                alert(`${eliminated.name} ليس مندساً. فاز المندسون!`);
            }
        }
    }
}

/**
 * Restart current game with same players.
 */
async function restartGame() {
    const category = document.getElementById("mondasCat").value;
    const undercoverCount = parseInt(document.getElementById("numSpies").value, 10);

    const response = await fetch(`/api/undercover/rooms/${currentRoomCode}/restart`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            category: category,
            undercover_count: undercoverCount
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "تعذر إعادة اللعبة.");
        return;
    }

    cachedSecretWord = "";
    selectedVotes = [];
    currentRoomData = data;
    isHost = currentPlayerId === data.host_id;
    renderWaitingRoom(data);
}

/**
 * Leave current room as non-host before game starts.
 */
async function leaveCurrentRoom() {
    if (!currentRoomCode || !currentPlayerId) return;

    const confirmed = confirm("هل أنت متأكد أنك تريد الخروج من الغرفة؟");
    if (!confirmed) return;

    const response = await fetch(`/api/undercover/rooms/${currentRoomCode}/leave`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            player_id: currentPlayerId
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "تعذر الخروج من الغرفة.");
        return;
    }

    clearLocalGameState();
    goBackToLobby();
}

/**
 * Delete current room as host.
 */
async function deleteCurrentRoom() {
    if (!currentRoomCode || !currentPlayerId) return;

    const confirmed = confirm("هل أنت متأكد أنك تريد حذف الغرفة بالكامل؟");
    if (!confirmed) return;

    const response = await fetch(`/api/undercover/rooms/${currentRoomCode}/delete`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            player_id: currentPlayerId
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.detail || "تعذر حذف الغرفة.");
        return;
    }

    clearLocalGameState();
    goBackToLobby();
}

/**
 * Render final screen.
 */
function renderGameOver(data) {
    hideAll();
    document.getElementById("screen-game-over").classList.remove("hidden");

    const finalMsg = document.getElementById("final-msg");

    if (data.winner === "players") {
        finalMsg.textContent = "كفو! تم كشف جميع المندسين بنجاح ✅";
    } else {
        finalMsg.textContent = "خسارة! تم التصويت على لاعب بريء.. فاز المندسون!";
    }

    const replayArea = document.getElementById("adminReplayArea");
    const memberArea = document.getElementById("memberGameOverArea");

    if (isHost) {
        replayArea.classList.remove("hidden");
        memberArea.classList.add("hidden");
    } else {
        replayArea.classList.add("hidden");
        memberArea.classList.remove("hidden");
    }
}

/**
 * Reset local state and go back to start.
 */
function resetAndExit() {
    clearLocalGameState();
    window.location.reload();
}

/**
 * Clear local room/player state.
 */
function clearLocalGameState() {
    localStorage.removeItem("undercover_room_code");
    localStorage.removeItem("undercover_player_id");
    localStorage.removeItem("undercover_player_name");

    currentRoomCode = null;
    currentPlayerId = null;
    currentPlayerName = null;
    currentRoomData = null;
    selectedVotes = [];
    cachedSecretWord = "";
    isHost = false;
}

/**
 * Hide all screens.
 */
function hideAll() {
    document.querySelectorAll(".card").forEach((card) => card.classList.add("hidden"));
}

/**
 * Poll room state every few seconds.
 */
setInterval(async () => {
    if (currentRoomCode && currentPlayerId) {
        await refreshRoomState();
    }
}, 3000);